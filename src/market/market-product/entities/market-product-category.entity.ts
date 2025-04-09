import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MarketProductModel } from "./market-product.entity";
import { MarketProductCategory } from "../const/product-category-enum.const";
import { IsEnum } from "class-validator";

@Entity({ name: "MarketProductCategory" })
export class MarketProductCategoryModel {

    @Column({
        primary: true,
        type: "enum",
        enum: Object.values(MarketProductCategory),
        default: MarketProductCategory.STICKER,
    })
    code: MarketProductCategory;

    @Column()
    name: string;


}