import { UserModel } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "Diary"})
export class DiaryModel {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne( () => UserModel, (user) => user.diarys, { nullable: false})
    nickname: UserModel;

    @Column()
    title: string;

    @Column()
    content: string;

    @Column({name: "like_count"})
    likeCount: number;

    @Column({name: "comment_count"})
    commentCount: number;

    @Column({
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
        transformer: {
          from: (value: Date) => new Date(value).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }), //DB에서 가져올 때
          to: (value: string | Date) => (typeof value === 'string' ? new Date(value) : value),  // DB에 저장할 때
        },
      })
      createAt: string;
  }