import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { BaseModel } from "src/common/entities/base.entity";
import { IsString } from "class-validator";

@Entity({name: "Market"})
export class MarketModel extends BaseModel {

    @Column()
    userId: number;

    // 마켓 이름
    @Column()
    @IsString({message: 'name:string 입력해야 합니다.'})
    name: string;

    // 구독자 수
    @Column({default: 0})
    subscribers: number;

    // 마켓 소개
    @Column({ nullable: true })
    introduction?: string;

    // 마켓 공지사항
    @Column({ nullable: true })
    notice?: string;

    // 마켓 프로필 이미지
    @Column({ nullable: true })
    image?: string;


    @Column({ nullable: true })
    startDate?: string;

    @Column({ nullable: true })
    endDate: string;

    // 마켓 오픈 상태
    @Column({default: false})
    isOpen: boolean;


    
}