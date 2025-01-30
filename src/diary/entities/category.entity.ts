import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { SpaceModel } from "./space.entity";
import { DiaryModel } from "./diary.entity";


@Entity({ name: "Category" })
export class CategoryModel {

    @Column({primary: true, type: "varchar", length: 10 })
    id: string;

    @Column()
    name: string;

    @ManyToOne(() => SpaceModel, (space) => space.categories, {nullable:false})
    @JoinColumn({name: "spaceId"}) // 외래 키 설정
    space: SpaceModel;

    @OneToMany(() => DiaryModel, (diary) => diary.category)
    dairys: DiaryModel[];


}