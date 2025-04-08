import { MarketModel } from "../entities/market.entity";
import { PickType } from "@nestjs/mapped-types";


/**
 * 마켓 생성 DTO
 * @property {string} `name` 마켓 이름
 * @property {string} `introduction` 마켓 소개
 * @property {string} `image` 마켓 프로필 이미지
 * @property {string} `startDate` 마켓 시작일
 * @property {string} `endDate` 마켓 종료일
 * @property {boolean} `isOpen` 마켓 오픈 상태
 * @property {string} `notice` 마켓 공지사항
 * @extends MarketModel
 */
export class CreateMarketDto extends PickType(MarketModel, [
    'name',
    'introduction',
    'image',
    'startDate',
    'endDate',
    'isOpen',
    'notice'
]){
}