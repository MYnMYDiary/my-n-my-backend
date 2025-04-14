import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MarketProductModel } from "../entities/market-product.entity";
import { Repository } from "typeorm";
import { MarketProductCategory } from "../const/product-category-enum.const";
import { DEFAULT_MARKET_PRODUCT_SELECTIONS } from "../const/query-base-select.const";

@Injectable()
export class MarketProductQuery {
    constructor(
        @InjectRepository(MarketProductModel)
        private readonly marketProductRepository: Repository<MarketProductModel>
    ) {}

    async findAllMarketProducts(marketId: number, category?: MarketProductCategory) {
        const query = this.marketProductRepository
            .createQueryBuilder('marketProduct')
            .select([...DEFAULT_MARKET_PRODUCT_SELECTIONS])
            .where('marketProduct.marketId = :marketId', { marketId });

        if (category) {
            query.andWhere('marketProduct.category = :category', { category });
        }

        const marketProducts = await query.getRawMany();

        if (!marketProducts.length) {
            throw new NotFoundException('상품을 찾을 수 없습니다.');
        }

        return marketProducts;
    }
}