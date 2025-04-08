import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MarketModel } from './entities/market.entity';
import { Repository } from 'typeorm';
import { CreateMarketDto } from './dto/create-market.dto';
import { MarketSubscribeModel } from './entities/market-subscribe.entity';
import { MarketSubscribeQuery } from './queries/market-subscribe.query';


@Injectable()
export class MarketService {

    constructor(
        // Entity
        @InjectRepository(MarketModel)
        private readonly marketRepository: Repository<MarketModel>,
        @InjectRepository(MarketSubscribeModel)
        private readonly marketSubscribeRepository: Repository<MarketSubscribeModel>,

        // Query
        private readonly marketSubscribeQuery: MarketSubscribeQuery
    ){}


    /**
     * 마켓 생성
     * @param createMarketDto 
     * @param userId 
     * @returns
     */
    async createMarket(createMarketDto: CreateMarketDto, userId: number){
        // useId로 만들어진 마켓이 있는지 검증
        const market = await this.marketRepository.findOne({
            where: {
                userId: userId
            }
        });

        // 마켓이 이미 존재하는 경우 메시지
        if(market) throw new BadRequestException('마켓은 하나만 생성 가능합니다.');
    
        //마켓 생성
        const newMarket = this.marketRepository.create({
            userId: userId,
            ...createMarketDto
        });

        return this.marketRepository.save(newMarket);
    }


    /** 
     * 마켓 조회
     * @param userId 
     * @returns 
     */
    async getMarket(userId?: number) {
        const market = await this.marketRepository.findOne({
            where: {    
                userId: userId
            }
        });

        return {
            exists: !!market,
            data: market || null
        };
    }   

    /**
     * 마켓 구독
     * @param userId 
     * @param marketId 
     * @returns 
     */
    async subscribeMarket(userId: number, marketId: number){
        return this.marketSubscribeQuery.marketSubscribe(userId, marketId);
    }
}


