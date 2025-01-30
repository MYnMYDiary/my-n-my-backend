import { Column, Entity, OneToMany } from "typeorm";
import { CategoryModel } from "./category.entity";


@Entity({ name: "Space" })
export class SpaceModel {

    @Column({primary: true, type: "varchar", length: 10 })
    id: string;

    @Column()
    name: string;

    @OneToMany(() => CategoryModel, (category) => category.space )
    categories: CategoryModel[];

}