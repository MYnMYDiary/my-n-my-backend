import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export abstract class BaseModel {

    @PrimaryGeneratedColumn()
    id: number;

    @UpdateDateColumn({
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
        transformer: {
          from: (value: Date) => new Date(value).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }), //DB에서 가져올 때
          to: (value: string | Date) => (typeof value === 'string' ? new Date(value) : value),  // DB에 저장할 때
        },
    })
    updatedAt: Date;

    @CreateDateColumn({
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
        transformer: {
          from: (value: Date) => new Date(value).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }), //DB에서 가져올 때
          to: (value: string | Date) => (typeof value === 'string' ? new Date(value) : value),  // DB에 저장할 때
        },
    })
    createdAt: Date;
} 