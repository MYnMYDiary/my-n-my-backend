import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseModel } from "src/common/entities/base.entity";
import { IsArray, IsBoolean, IsNumber, IsString } from "class-validator";
import { MarketProductCategoryModel } from "./market-product-category.entity";
import { MarketProductCategory } from "../const/product-category-enum.const";

@Entity({name: "MarketProduct"})
export class MarketProductModel extends BaseModel {

    @Column({
        type: "enum",
        enum: Object.values(MarketProductCategory),
        default: MarketProductCategory.STICKER,
    })
    category: MarketProductCategory;

    // 상품 코드
    @Column({unique: true})
    @IsString({message: 'productCode는 string 타입을 넣어줘야 합니다.'})
    productCode: string;

    // 마켓 ID(어떤 마켓에서 판매하는지)
    @Column()
    @IsNumber({}, {message: 'marketId는 number 타입을 넣어줘야 합니다.'})
    marketId: number;

    // 상품 이미지
    @Column('text', { array: true, nullable: true })
    @IsArray()
    @IsString({ each: true })
    images: string[];

    // 상품 이름
    @Column()
    @IsString({message: 'name은 string 타입을 넣어줘야 합니다.'})
    name: string;

    // 상품 가격
    @Column()
    @IsNumber({}, {message: 'price는 number 타입을 넣어줘야 합니다.'})
    price: number;

    // 상품 설명
    @Column()
    @IsString({message: 'description은 string 타입을 넣어줘야 합니다.'})
    description: string;

    // 상품 재고
    @Column()
    @IsNumber({}, {message: 'stock는 number 타입을 넣어줘야 합니다.'})
    stock: number;

    // 상품 판매 여부
    @Column()
    @IsBoolean({message: 'isSale는 boolean 타입을 넣어줘야 합니다.'})
    isSale: boolean;



}