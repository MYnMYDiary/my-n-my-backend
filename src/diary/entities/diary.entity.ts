import { BaseModel } from "src/common/entities/base.entity";
import { UserModel } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CategoryModel } from "./category.entity";
import { IsString } from "class-validator";
import { Transform } from "class-transformer";
import { join } from "path";
import { DIARY_IMAGE_PATH } from "src/common/const/path.const";

@Entity({ name: "Diary"})
export class DiaryModel extends BaseModel {

    @ManyToOne( () => UserModel, (user) => user.diarys, { nullable: false})
    @JoinColumn({ name: "userId" }) // ✅ 외래 키 설정
    user: UserModel;

    @ManyToOne(() => CategoryModel, (category) => category.dairys, { nullable: false})
    @JoinColumn({ name: "categoryId" })
    category: CategoryModel;

    @Column()
    @IsString({message:'title은 string 타입을 넣어줘야 합니다.'})
    title: string;

    @Column()
    @IsString({message:'content는 string 타입을 넣어줘야 합니다.'})
    content: string;

    @Column()
    image: string;

    @Column({name: "like_count"})
    likeCount: number;

    @Column({name: "comment_count"})
    commentCount: number;

  }