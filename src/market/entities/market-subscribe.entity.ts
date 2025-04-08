import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({name: "market_subscribe"})
export class MarketSubscribeModel {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    marketId: number;

    @Column()
    userId: number; 
}