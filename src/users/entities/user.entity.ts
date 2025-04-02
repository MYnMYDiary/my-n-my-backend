import { DiaryModel } from "src/diary/entities/diary.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserRole } from "../const/user.const";
import { BaseModel } from "src/common/entities/base.entity";
import { DiaryLikeModel } from "src/diary/entities/like.entity";

@Entity({ name: "User" })
export class UserModel extends BaseModel {
    
    // 컬럼

    /**
     * 이메일
     * @description 유일무이한 값이 될 것
     */
    @Column({ unique: true })
    email: string;

    /**
     * 닉네임
     * @description 길이가 20을 넘지 않을 것, 유일무이한 값이 될 것
     */
    @Column({ length: 20, unique: true })
    nickname: string;

    @Column()
    password: string;

    /**
     * 프로필 이미지
     * @description 이미지 파일 경로, 공백 허용
     */
    @Column({ nullable: true })
    profileImage?: string;

    /**
     * 역할
     * @description enum으로 정의되어 있다. 
     */
    @Column({
        type: "enum",
        enum: Object.values(UserRole), // 모든 Enum 값을 자동으로 가져옴(유지보수 용이)
        default: UserRole.USER,
    })
    role: UserRole;


    // Relations
    @OneToMany( () => DiaryModel, (diary) => diary.user)
    diarys : DiaryModel[];

    /**
     * 좋아요 목록
     */
    @OneToMany(() => DiaryLikeModel, (diaryLike) => diaryLike.user)
    diaryLikes: DiaryLikeModel[];

}
