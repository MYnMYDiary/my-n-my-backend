import { PickType } from "@nestjs/mapped-types";
import { DiaryModel } from "../entities/diary.entity";
import { IsString } from "class-validator";

/**
 * 마이페이지 다이어리 조회 DTO
 * @property {string} `categoryId` 카테고리 아이디
 * @property {string} `year` 년
 * @property {string} `month` 월
 * 
 * @extends DiaryModel
 */
export class MyDiaryDto extends PickType(DiaryModel, ['year', 'month']){

    @IsString({message: 'categoryId는 string 타입을 넣어줘야 합니다.'})
    categoryId: string;
}