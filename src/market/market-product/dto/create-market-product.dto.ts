import { PickType } from "@nestjs/mapped-types";
import { MarketProductModel } from "../entities/market-product.entity";
import { IsArray, IsEnum } from "class-validator";
import { MarketProductCategory } from "../const/product-category-enum.const";

/**
 * 마켓 상품 생성 DTO   
 * @property {string[]} `images` 상품 이미지
 * @property {string} `name` 상품 이름
 * @property {number} `price` 상품 가격
 * @property {string} `description` 상품 설명
 * @property {number} `stock` 상품 재고
 * @property {boolean} `isSale` 상품 판매 여부
 * @property {MarketProductCategory} `categoryId` 상품 카테고리
 */
export class CreateMarketProductDto extends PickType(MarketProductModel, [
    'images',
    'name',
    'price',
    'description',
    'stock',
    'isSale'
]) {
    @IsEnum(MarketProductCategory, {message: 'categoryId는 MarketProductCategory 타입을 넣어줘야 합니다.'})
    categoryId: MarketProductCategory;
}