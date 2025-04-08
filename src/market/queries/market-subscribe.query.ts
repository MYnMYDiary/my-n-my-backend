import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MarketSubscribeModel } from "../entities/market-subscribe.entity";
import { Injectable, NotFoundException } from "@nestjs/common";
import { MarketModel } from "../entities/market.entity";


@Injectable()
export class MarketSubscribeQuery {

    constructor(
        @InjectRepository(MarketModel)
        private readonly marketRepository: Repository<MarketModel>,
        @InjectRepository(MarketSubscribeModel)
        private readonly marketSubscribeRepository: Repository<MarketSubscribeModel>,
    ) {}


    async marketSubscribe(userId: number, marketId: number){
        return await this.marketSubscribeRepository.manager.transaction(async (transactionalEntityManager) => {

            // 마켓 상태
            const market = await transactionalEntityManager
                .createQueryBuilder(MarketModel, 'market')
                .where('market.id = :marketId', { marketId })
                .getOne();

            if(!market){
                throw new NotFoundException('마켓을 찾을 수 없습니다.');
            }

            // 원래 구독자 수
            const prevSubscribers = market.subscribers;
                   

            // 구독상태 확인
            const existingSubscribe = await transactionalEntityManager
                .createQueryBuilder(MarketSubscribeModel, 'marketSubscribe')
                .where('marketSubscribe.userId = :userId', { userId })
                .andWhere('marketSubscribe.marketId = :marketId', { marketId })
                .getOne();
            
            if(existingSubscribe){  
                // 구독이 돼있으면 구독 취소
                await transactionalEntityManager
                    .createQueryBuilder()
                    .delete()
                    .from(MarketSubscribeModel)
                    .where('id = :id', { id: existingSubscribe.id })
                    .execute();
                
                // 구독 취소 후 구독자 수 감소
                await transactionalEntityManager
                    .createQueryBuilder()
                    .update(MarketModel)
                    .set({
                        subscribers: () => 'subscribers - 1'
                    })
                    .where('id = :id', { id: marketId })
                    .execute();

                return {
                    userId,
                    marketId,
                    prevSubscribers,
                    subscribers: prevSubscribers - 1 // 구독 취소 후 구독자 수 감소
                };
            } else {
                // 구독이 돼있지 않으면 구독
                await transactionalEntityManager
                    .createQueryBuilder()
                    .insert()
                    .into(MarketSubscribeModel)
                    .values({ userId, marketId })
                    .execute();

                // 구독 후 구독자 수 증가
                await transactionalEntityManager
                    .createQueryBuilder()
                    .update(MarketModel)
                    .set({ subscribers: () => 'subscribers + 1' })
                    .where('id = :id', { id: marketId })
                    .execute();

                return {
                    userId,
                    marketId,
                    prevSubscribers,
                    subscribers: prevSubscribers + 1 // 구독 후 구독자 수 증가
                };
            }
        });
    }
}