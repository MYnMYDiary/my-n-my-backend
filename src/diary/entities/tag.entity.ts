import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { DiaryModel } from "./diary.entity";

@Entity({ name: "Tag" })
export class TagModel {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ default: 1 })
    count: number;

    @ManyToMany(() => DiaryModel, (diary) => diary.tags)
    diaries: DiaryModel[];
}