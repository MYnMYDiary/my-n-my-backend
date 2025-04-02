import { Repository } from 'typeorm';
import { DiaryModel } from '../entities/diary.entity';
import { DEFAULT_DIARY_SELECTIONS } from '../const/diary.const';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateDiaryDto } from '../dto/pagenate-diary.dto';
import { MyDiaryDto } from '../dto/mydiary.dto';
import { DiaryLikeModel } from '../entities/like.entity';

@Injectable()
export class DiaryQuery {
  constructor(
    @InjectRepository(DiaryModel)
    private readonly diaryRepository: Repository<DiaryModel>
  ) {}

  /**
   * 다이어리 조회 쿼리 Base
   * @param includeTags 태그 포함 여부 - 기본값은 false(태그 가져오지 않음)
   * @returns 다이어리 조회 쿼리 빌더
   */
  getBaseDiaryQueryBuilder(includeTags: boolean = false) {
    const query = this.diaryRepository
      .createQueryBuilder('diary')
      .leftJoinAndSelect('diary.category', 'category')
      .leftJoinAndSelect('category.space', 'space')
      .leftJoinAndSelect('diary.user', 'user');

    // 태그 포함 여부
    if (includeTags) {
      query
        .leftJoinAndSelect('diary.tags', 'tags');
    }

    return query;
  }

  /**
   * 모든 다이어리를 조회
   */
  async findAllDiaries(page: PaginateDiaryDto, categoryId: string, userId?: number) {
    const diaries = await this.getBaseDiaryQueryBuilder()
      .select([
        ...DEFAULT_DIARY_SELECTIONS,
        'CASE WHEN diaryLike.id IS NOT NULL THEN true ELSE false END as "isLiked"'
      ])
      .where('space.id = :spaceId', { spaceId: 'D' })
      .andWhere('category.id = :categoryId', { categoryId: categoryId })
      .andWhere('diary.id > :diaryId', { diaryId: page.id_gt || 0 })
      .orderBy(`diary.${page.sort}`, page.order)
      .limit(page.limit)

    // userId가 있을 때만 좋아요 정보 JOIN
    if (userId) {
      diaries
        .leftJoin(DiaryLikeModel, 'diaryLike', 
            'diaryLike.diary.id = diary.id AND diaryLike.user.id = :userId', 
            { userId }
        );
    }else {
      // userId가 없을 때는 무조건 false
      diaries.addSelect('false as "isLiked"');
  }


    return diaries.getRawMany();
  }

  /**
   * 다이어리 아이디에 해당하는 다이어리 조회
   */
  async findDiaryById(id: number) {
    const diary = await this.getBaseDiaryQueryBuilder()
      .select([
        ...DEFAULT_DIARY_SELECTIONS,
        'diary.content AS content',
      ])
      .where('diary.id = :id', { id })
      .andWhere('space.id = :spaceId', { spaceId: 'D' })
      .orderBy('diary.createdAt', 'ASC')
      .getRawOne();

    if (!diary) {
      return null;
    }

    // 태그 조회
    const tags = await this.diaryRepository
      .createQueryBuilder('diary')
      .select('tags.name', 'name')
      .leftJoin('diary.tags', 'tags')
      .where('diary.id = :id', { id })
      .getRawMany();

    return {
      ...diary,
      tag_names: tags.map(tag => tag.name)
    };
  }

    /**
     * 마이페이지-다이어리-목록
     * @param userId 유저 아이디
     * @param filter 필터 -년, 월, 카테고리아이디
     * @param page 페이지네이션
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

      const diary = await this.getBaseDiaryQueryBuilder(true) // 태그 포함
      .leftJoin(DiaryLikeModel, 'diaryLike', 
        'diaryLike.diary.id = diary.id AND diaryLike.user.id = :userId', 
        { userId }
      )
      .select([
        ...DEFAULT_DIARY_SELECTIONS, 
        'diary.content AS content', 
        'category.id AS categoryId', 
        'tags.name AS tagName',
        'CASE WHEN diaryLike.id IS NOT NULL THEN true ELSE false END as "isLiked"'
      ])
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

          // 태그 조회
          const tags = await this.diaryRepository
          .createQueryBuilder('diary')
          .select('tags.name', 'name')
          .leftJoin('diary.tags', 'tags')
          .where('diary.id = :id', { id: diaryId })
          .getRawMany();

          return {
            data: diary,
            prev: prevDiary?.diary_id ?? null,
            next: nextDiary?.diary_id ?? null,
            tags: tags.map(tag => tag.name)
          };
      }
    }

    /**
     * 다이어리 좋아요
     * @param userId 유저 아이디
     * @param diaryId 다이어리 아이디
     * @returns 최종 좋아요 개수
     */
    async diaryLike(userId: number, diaryId: number) {
        return await this.diaryRepository.manager.transaction(async (transactionalEntityManager) => {
            
          // 현재 다이어리 상태 확인
            const diary = await transactionalEntityManager
                .createQueryBuilder(DiaryModel, 'diary')
                .where('diary.id = :diaryId', { diaryId })
                .getOne();

            if (!diary) {
                throw new NotFoundException('다이어리를 찾을 수 없습니다.');
            }

            const prevLike = diary.likeCount;

            // 이미 좋아요를 눌렀는지 확인
            const existingLike = await transactionalEntityManager
                .createQueryBuilder(DiaryLikeModel, 'diaryLike')
                .where('diaryLike.diary.id = :diaryId', { diaryId })
                .andWhere('diaryLike.user.id = :userId', { userId })
                .getOne();

            if (existingLike) {
                // 좋아요가 이미 있으면 삭제
                await transactionalEntityManager
                    .createQueryBuilder()
                    .delete()
                    .from(DiaryLikeModel)
                    .where('diary.id = :diaryId', { diaryId })
                    .andWhere('user.id = :userId', { userId })
                    .execute();

                // likeCount 감소
                await transactionalEntityManager
                    .createQueryBuilder()
                    .update(DiaryModel)
                    .set({
                        likeCount: () => 'likeCount - 1'
                    })
                    .where('id = :diaryId', { diaryId })
                    .execute();

                return {
                    diaryId,
                    prevLike,
                    likeCount: diary.likeCount -1
                };
            } else {
                // 좋아요가 없으면 추가
                await transactionalEntityManager
                    .createQueryBuilder()
                    .insert()
                    .into(DiaryLikeModel)
                    .values({
                        user: { id: userId },
                        diary: { id: diaryId }
                    })
                    .execute();

                // likeCount 증가
                await transactionalEntityManager
                    .createQueryBuilder()
                    .update(DiaryModel)
                    .set({
                        likeCount: () => 'likeCount + 1'
                    })
                    .where('id = :diaryId', { diaryId })
                    .execute();

                return {
                    diaryId,
                    prevLike,
                    likeCount: diary.likeCount + 1
                };
            }
        });
    }

}