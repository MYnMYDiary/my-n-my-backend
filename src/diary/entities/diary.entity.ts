import { BaseModel } from "src/common/entities/base.entity";
import { UserModel } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "Diary"})
export class DiaryModel extends BaseModel {

    @ManyToOne( () => UserModel, (user) => user.diarys, { nullable: false})
    @JoinColumn({ name: "userId" }) // ✅ 외래 키 설정
    user: UserModel;

    @Column()
    title: string;

    @Column()
    content: string;

    @Column({name: "like_count"})
    likeCount: number;

    @Column({name: "comment_count"})
    commentCount: number;

  }