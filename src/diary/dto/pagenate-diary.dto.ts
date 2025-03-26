import { Type } from "class-transformer";
import { IsEnum, IsIn, IsNumber, IsOptional, IsString } from "class-validator";

enum DiaryOrderField {
    CREATE_AT = 'createdAt',
    LIKE_COUNT = 'likeCount',
    COMMENT_COUNT = 'commentCount'
}

/**
 * 다이어리 페이지네이션 DTO
 * @property `id_gt` 이전 마지막 데이터의 ID
 * @property `sort` 어떤 필드를 기준으로 정렬할지 (기본값: createAt)
 * @property `order` 생성된 시간으로 오름차/내림차 정렬. 기본값은 ASC
 * @property `limit` 조회할 데이터의 개수. 기본값은 20
 */
export class PaginateDiaryDto {

    /**
     * 이전 마지막 데이터의 ID. 
     * 이 프로퍼티에 입력된 ID보다 큰 ID를 가진 데이터만 조회
     */
    @IsNumber()
    @IsOptional()
    id_gt?: number;

    /**
    * 정렬할 필드명 (예: createAt)
    */
    @IsEnum(DiaryOrderField)
    @IsOptional()
    sort: string = DiaryOrderField.CREATE_AT;

    /**
     * 생성된 시간으로 오름차/내림차 정렬. 기본값은 ASC
     */
    @IsIn(['ASC'])
    @IsOptional()
    order?: 'ASC' = 'ASC';


    /**
     * 조회할 데이터의 개수. 기본값은 10
     */
    @IsNumber()
    @IsOptional()
    limit: number = 10;
}