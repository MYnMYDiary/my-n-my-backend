import { Repository } from 'typeorm';
import { DiaryModel } from '../entities/diary.entity';
import { DEFAULT_DIARY_SELECTIONS } from '../const/diary.const';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateDiaryDto } from '../dto/pagenate-diary.dto';

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
     * 유저 아이디에 해당하는 다이어리를 가져옴
     * @param userId 유저 아이디
     * @param categoryId 카테고리 아이디
     * @returns 유저 아이디에 해당하는 다이어리
     */
    async findMyDiary(userId: number, categoryId: string, page: PaginateDiaryDto) {
        const query = this.getBaseDiaryQueryBuilder()
            .select([...DEFAULT_DIARY_SELECTIONS, 'category.id AS categoryId'])
            .where('space.id = :spaceId', { spaceId: 'D' })
            .andWhere('user.id = :userId', { userId: Number(userId) })
            .andWhere('diary.id > :diaryId', { diaryId: page.id_gt || 0 })
            .orderBy(`diary.${page.sort}`, page.order)
            .limit(page.limit = 20)

        if (categoryId) {
            // 디버깅을 위한 로그 추가
            console.log('Filtering by categoryId:', categoryId);
            query.andWhere('category.id = :categoryId', { categoryId: categoryId });
        }
        return query.getRawMany();
    }
}