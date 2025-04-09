import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MarketProductModel } from './entities/market-product.entity';
import { Repository } from 'typeorm';
import { CreateMarketProductDto } from './dto/create-market-product.dto';
import { MarketModel } from '../entities/market.entity';
import { MarketProductCategory } from './const/product-category-enum.const';
import { MARKET_PRODUCT_IMAGE_PATH, TEMP_FOLDER_PATH } from 'src/common/const/path.const';
import { basename, join } from 'path';
import { promises } from 'fs';
@Injectable()
export class MarketProductService {

    constructor(
        @InjectRepository(MarketProductModel)
        private readonly marketProductRepository: Repository<MarketProductModel>,
        @InjectRepository(MarketModel)
        private readonly marketRepository: Repository<MarketModel>,
    ) {}

    // 유저 아이디로 마켓 아이디 찾기
    async findMarket(userId: number){
        const market = await this.marketRepository.findOne({where: {userId: userId}});
        
        if(!market){
            throw new NotFoundException('마켓을 찾을 수 없습니다.');
        }

        return market.id;
    }

    // 상품 등록 전 검증
    async validateProduct(marketId: number, productCode: string){
        const existingProduct = await this.marketProductRepository.findOne({where: {productCode: productCode,marketId: marketId}});
        if(existingProduct){
            throw new BadRequestException('이미 존재하는 상품입니다.');
        }
    }

    // 상품 코드 만들기
    async createProductCode(marketId: number, product:CreateMarketProductDto){

        const marketIdString = marketId.toString().padStart(3, '0');
        const category = product.categoryId;
        // 카테고리에 존재하는 상품 개수
        const categoryProductCount = await this.marketProductRepository.count({where: {category: category}});
        const productCodeWithCount = (categoryProductCount + 1).toString().padStart(4, '0');
        const productCode = `M${marketIdString}${category}${productCodeWithCount}`;


        return productCode;
    }

    /**
     * 마켓 상품 등록
     * @param userId 유저 아이디
     * @param createMarketProductDto 마켓 상품 등록 정보
     */
    async createMarketProduct(userId: number, createMarketProductDto: CreateMarketProductDto){

        // 마켓 아이디 찾기
        const marketId = await this.findMarket(userId);

        // 상품 코드 만들기
        const productCode = await this.createProductCode(marketId, createMarketProductDto); 

        // 이미 존재하는 상품인지 확인  
        await this.validateProduct(marketId, productCode); 

        // 상품 등록
        const marketProduct = this.marketProductRepository.create({
            ...createMarketProductDto,
            marketId: marketId,
            productCode: productCode
        });

        return this.marketProductRepository.save(marketProduct);        
    }

    /**
     * 마켓 상품 전체 조회
     * @param id 상품 아이디
     */
    async getMarketProduct(category?: MarketProductCategory){
        let marketProduct;

        if(category){
            marketProduct = await this.marketProductRepository.find({where: {category: category as MarketProductCategory}});
        }else{
            marketProduct = await this.marketProductRepository.find();
        }

        if(!marketProduct){
            throw new NotFoundException('상품을 찾을 수 없습니다.');
        }

        return marketProduct;
    }

    /** 
     * 마켓 상품 상세 조회
     * @param id 상품 아이디
     */
    async getMarketProductById(id: number){
        const marketProduct = await this.marketProductRepository.findOne({where: {id: id}});    

        if(!marketProduct){
            throw new NotFoundException('상품을 찾을 수 없습니다.');
        }

        return marketProduct;
    }

    /**
     * 마켓 상품 수정
     * @param userId 유저 아이디
     * @param updateMarketProductDto 마켓 상품 수정 정보
     */
    async updateMarketProduct(id: number, product: Partial<CreateMarketProductDto>){

        // 상품 아이디로 상품 조회
        const marketProduct = await this.marketProductRepository.findOne({where: {id}});

        if(!marketProduct){
            throw new NotFoundException('상품을 찾을 수 없습니다.');
        }

        // 업데이트할 이미지가 존재할 경우
        if(product.images){
            const oldImages = marketProduct.images || []; // 기존 이미지 배열
            const imagesToDelete = oldImages.filter(img => !(product.images || []).includes(img)); // 삭제할 이미지 배열
            const imagesToAdd = (product.images || []).filter(img => !oldImages.includes(img)); // 추가할 이미지 배열

            if(imagesToDelete.length) await this.deleteMarketProductImage(imagesToDelete);
            if(imagesToAdd.length) await this.createMarketProductImage(imagesToAdd);
        }

        // update와 findOne 대신 save 사용
        await this.marketProductRepository.update(id, {
            ...product,
        });

        return await this.marketProductRepository.findOne({where: {id}});
    }

    /**
     * 마켓 상품 삭제
     * @param id 상품 아이디
     */
    async deleteMarketProduct(id: number){

        const marketProduct = await this.marketProductRepository.findOne({where: {id: id}});

        if(!marketProduct){
            throw new NotFoundException('상품을 찾을 수 없습니다.');
        }   

        this.marketProductRepository.delete(id);
        await this.deleteMarketProductImage(marketProduct.images);

        return {
            message: `${marketProduct.name} 상품이 삭제되었습니다.`
        }
    }

    /**
     * 마켓 상품 이미지 등록
     * @param images 이미지 배열
     */
    async createMarketProductImage(images: string[]){
        try {
            await Promise.all(
                images.map(async (image) => {
                    const tempFilePath = join(TEMP_FOLDER_PATH, image);
                    const newPath = join(MARKET_PRODUCT_IMAGE_PATH, image);

                    try {
                        await promises.access(tempFilePath);
                    } catch (error) {
                        throw new BadRequestException('존재하지 않는 파일 입니다.');
                    }

                    await promises.rename(tempFilePath, newPath);
                })
            );
            return true;
        } catch (error) {
            throw new BadRequestException('이미지 업로드 중 오류가 발생했습니다.');
        }
    }

    /**
     * 마켓 상품 이미지 수정
     * @param productId 상품 아이디
     * @param newImages 새로운 이미지 배열
     */
    async updateMarketProductImage(productId: number, newImages: string[]) {
        // 아이디로 상품 조회
        const product = await this.marketProductRepository.findOne({
            where: { id: productId }
        });

        if(!product){
            throw new NotFoundException('상품을 찾을 수 없습니다.');
        }

        // 이미지 배열 추출
        const oldImages = product.images;

        // 삭제될 이미지 찾기 (기존 이미지 중 새 목록에 없는 것)
        const imagesToDelete = oldImages.filter(img => !newImages.includes(img));
        
        // 추가될 이미지 찾기 (새 목록 중 기존에 없는 것)
        const imagesToAdd = newImages.filter(img => !oldImages.includes(img));

        // 필요한 이미지만 삭제/추가
        if (imagesToDelete.length) await this.deleteMarketProductImage(imagesToDelete);
        if (imagesToAdd.length) await this.createMarketProductImage(imagesToAdd);

        return true;
    }

    /**
     * 마켓 상품 이미지 삭제
     * @param images 이미지 배열
     */
    async deleteMarketProductImage(images: string[]){
        try {
            await Promise.all(
                images.map(async (image) => {
                    const filePath = join(MARKET_PRODUCT_IMAGE_PATH, image);
                        await promises.access(filePath);  // 파일 존재 여부 확인
                        await promises.unlink(filePath);  // 파일이 있을 때만 삭제
                })
            );
            return true;
        } catch (error) {
            throw new BadRequestException('이미지 삭제 중 오류가 발생했습니다.');
        }
    }   
}


