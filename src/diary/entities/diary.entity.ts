
import { BaseModel } from "src/common/entities/base.entity";
import { UserModel } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany} from "typeorm";
import { CategoryModel } from "./category.entity";
import { IsString } from "class-validator";
import { TagModel } from "./tag.entity";  
import { DiaryLikeModel } from "./like.entity";
// import { Transform } from "class-transformer";   
// import { join } from "path";
// import { DIARY_IMAGE_PATH } from "src/common/const/path.const";

@Entity({ name: "Diary"})
export class DiaryModel extends BaseModel {

    @ManyToOne( () => UserModel, (user) => user.diarys, { nullable: false})
    @JoinColumn({ name: "userId" }) // ✅ 외래 키 설정
    user: UserModel;

    @ManyToOne(() => CategoryModel, (category) => category.dairys, { nullable: false})
    @JoinColumn({ name: "categoryId" })
    category: CategoryModel;

    @Column()
    @IsString({message:'year은 string 타입을 넣어줘야 합니다.'})
    year: string;

    @Column()
    @IsString({message:'month는 string 타입을 넣어줘야 합니다.'})
    month: string;

    @Column()
    @IsString({message:'title은 string 타입을 넣어줘야 합니다.'})
    title: string;

    @Column()
    @IsString({message:'content는 string 타입을 넣어줘야 합니다.'})
    content: string;

    @Column()
    @IsString({message:'image는 string 타입을 넣어줘야 합니다.'})
    //@Transform(({value}) => value && `${join(DIARY_IMAGE_PATH, value)}`)
    image: string;

    @Column({name: "like_count"})
    likeCount: number;


    @Column({name: "comment_count"})
    commentCount: number;

    @OneToMany(() => DiaryLikeModel, diaryLike => diaryLike.diary)
    likes: DiaryLikeModel[];

    @ManyToMany(() => TagModel, (tag) => tag.diaries)
    @JoinTable({
        name: "diary_tags", // 중간 테이블 이름
        joinColumn: {
            name: "diary_id",
            referencedColumnName: "id"
        },
        inverseJoinColumn: {
            name: "tag_id",
            referencedColumnName: "id"
        }
    })
    tags: TagModel[];

  }