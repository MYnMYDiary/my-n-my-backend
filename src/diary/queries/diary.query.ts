import { Repository } from 'typeorm';
import { DiaryModel } from '../entities/diary.entity';
import { DEFAULT_DIARY_SELECTIONS } from '../const/diary.const';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateDiaryDto } from '../dto/pagenate-diary.dto';
import { MyDiaryDto } from '../dto/mydiary.dto';

@Injectable()
export class DiaryQuery {
  constructor(
    @InjectRepository(DiaryModel)
    private readonly diaryRepository: Repository<DiaryModel>
  ) {}

  getBaseDiaryQueryBuilder() {
    return this.diaryRepository
      .createQueryBuilder('diary')
      .leftJoinAndSelect('diary.category', 'category')
      .leftJoinAndSelect('category.space', 'space')
      .leftJoinAndSelect('diary.user', 'user');
  }

  /**
   * 모든 다이어리를 조회
   */
  async findAllDiaries(page: PaginateDiaryDto, categoryId: string) {
    return this.getBaseDiaryQueryBuilder()
      .select([...DEFAULT_DIARY_SELECTIONS])
      .where('space.id = :spaceId', { spaceId: 'D' })
      .andWhere('category.id = :categoryId', { categoryId: categoryId })
      .andWhere('diary.id > :diaryId', { diaryId: page.id_gt || 0 })
      .orderBy(`diary.${page.sort}`, page.order)
      .limit(page.limit)
      .getRawMany();
  }

  /**
   * 다이어리 아이디에 해당하는 다이어리 조회
   */
  async findDiaryById(id: number) {
    return this.getBaseDiaryQueryBuilder()
      .select([
        ...DEFAULT_DIARY_SELECTIONS,
        'diary.content AS content',
      ])
      .where('diary.id = :id', { id })
      .andWhere('space.id = :spaceId', { spaceId: 'D' }) // space.id가 'DAKU'인 데이터 필터링
      .orderBy('diary.createdAt', 'ASC')
      .getRawMany();
  }

    /**
     * 유저 아이디에 해당하는 다이어리 목록 조회
     * @param userId 유저 아이디
     * @param categoryId 카테고리 아이디
     * @returns 유저 아이디에 해당하는 다이어리 목록
     */
    async findMyDiary(userId: number, filter: MyDiaryDto, page: PaginateDiaryDto) {
        const query = this.getBaseDiaryQueryBuilder()
            .select([...DEFAULT_DIARY_SELECTIONS, 'category.id AS categoryId'])
            .where('space.id = :spaceId', { spaceId: 'D' })
            .andWhere('user.id = :userId', { userId: Number(userId) })
            .andWhere('diary.id > :diaryId', { diaryId: page.id_gt || 0 })
            .andWhere('diary.year = :year', { year: filter.year })
            .andWhere('diary.month = :month', { month: filter.month })
            .orderBy(`diary.${page.sort}`, page.order)
            .limit(page.limit = 20)

        if (filter.categoryId) {
            // 디버깅을 위한 로그 추가
            console.log('카테고리별 조회:', filter.categoryId);
            console.log('연도별 조회:', filter.year);
            console.log('월별 조회:', filter.month);
            query.andWhere('category.id = :categoryId', { categoryId: filter.categoryId });
        }
        return query.getRawMany();
    }

    /**
     * 유저 아이디에 해당하는 다이어리 상세보기
     * @param userId 유저 아이디
     * @param diaryId 다이어리 아이디
     * @returns 유저 아이디에 해당하는 다이어리 상세보기
     */
    async findMyDiaryById(userId: number, diaryId: number, filter: MyDiaryDto){

      const diary = await this.getBaseDiaryQueryBuilder()
      .select([...DEFAULT_DIARY_SELECTIONS, 'diary.content AS content', 'category.id AS categoryId'])
      .where('space.id = :spaceId', { spaceId: 'D' })
      .andWhere('user.id = :userId', { userId: Number(userId) })
      .andWhere('diary.id = :diaryId', { diaryId: diaryId })
      .andWhere('diary.categoryId = :category', {category: filter.categoryId})
      .andWhere('diary.year = :year', {year: filter.year})
      .andWhere('diary.month = :month', {month: filter.month})
      .getRawOne();

      if(diary){

          const prevDiary = await this.getBaseDiaryQueryBuilder()
          .select('diary.id')
          .where('space.id = :spaceId', { spaceId: 'D' })
          .andWhere('user.id = :userId', { userId: Number(userId) })
          .andWhere('diary.id < :currentId', { currentId: diaryId })
          .andWhere('diary.categoryId = :category', {category: filter.categoryId})
          .andWhere('diary.year = :year', {year: filter.year})
          .andWhere('diary.month = :month', {month: filter.month})
          .orderBy('diary.id', 'DESC')
          .limit(1)
          .getRawOne();
    
          const nextDiary = await this.getBaseDiaryQueryBuilder()
          .select('diary.id')
          .where('space.id = :spaceId', { spaceId: 'D' })
          .andWhere('user.id = :userId', { userId: Number(userId) })
          .andWhere('diary.id > :currentId', { currentId: diaryId })
          .andWhere('diary.categoryId = :category', {category: filter.categoryId})
          .andWhere('diary.year = :year', {year: filter.year})
          .andWhere('diary.month = :month', {month: filter.month})
          .orderBy('diary.id', 'ASC')
          .limit(1)
          .getRawOne();

          return {
            data: diary,
            prev: prevDiary?.diary_id ?? null,
            next: nextDiary?.diary_id ?? null
          };
      }
    }

}