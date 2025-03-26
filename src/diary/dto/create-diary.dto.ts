import { IsString } from "class-validator";
import { DiaryModel } from "../entities/diary.entity";
import { PickType } from "@nestjs/mapped-types";

/**
 * 다이어리 만들기 DTO
 * @property {string} `categoryId` 카테고리 아이디
 * @property {string} `year` 년
 * @property {string} `month` 월
 * @property {string} `title` 제목
 * @property {string} `content` 내용
 * @property {string} `image` 이미지
 * 
 * @extends DiaryModel
 */
export class CreateDiaryDto extends PickType(DiaryModel, ['year', 'month', 'title', 'content', 'image' ]){

    @IsString({message: 'categoryId는 string 타입을 넣어줘야 합니다.'})
    categoryId: string;
}