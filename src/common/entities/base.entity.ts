import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

/**
 * 상속받아 사용하는 Base엔티티
 * @property {number} id
 * @property {date} CreateDateColumn
 * @property {date} UpdateDateColumn
 */
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
    })
    createdAt: Date;
} 