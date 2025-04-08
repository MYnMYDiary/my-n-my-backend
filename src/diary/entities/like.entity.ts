import { UserModel } from "src/users/entities/user.entity";
import { DiaryModel } from "./diary.entity";
import { Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";

@Entity({ name: "DiaryLike" })
export class DiaryLikeModel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserModel, user => user.diaryLikes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "userId" })
  user: UserModel;

  @ManyToOne(() => DiaryModel, diary => diary.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "diaryId" })
  diary: DiaryModel;
}