import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiaryModel } from './entities/diary.entity';
import { UserModel } from 'src/users/entities/user.entity';
import { CategoryModel } from './entities/category.entity';
import { SpaceModel } from './entities/space.entity';
import { CreateDiaryDto } from './dto/create-diary.dto';

@Injectable()
export class DiaryService {

  constructor(
    @InjectRepository(DiaryModel)
    private readonly diaryRepository: Repository<DiaryModel>
  ) {}

    /** 
     * 모든 다이어리를 다 가져옴
    */
    async getAllDiary() {
      return this.diaryRepository
      .createQueryBuilder('diary')
      .leftJoinAndSelect('diary.category', 'category') // Diary → Category 관계 사용
      .leftJoinAndSelect('category.space', 'space') // Category → Space 관계 사용
      .leftJoinAndSelect('diary.user', 'user') // Diary → User 관계 사용
      .select([
        'space.name',  // alias 추가
        'category.name',
        'user.nickname',
        'diary.id',
        'diary.title',
        'diary.content',
        'diary.createdAt',
      ])
      .where('space.id = :id', { id: 'DAKU' }) // category.id가 'DAKU'인 데이터만 필터링
      .orderBy('diary.createdAt', 'ASC')
      .getRawMany(); // 특정 필드만 선택했으므로 getRawMany() 사용
    }

    /** 
     * id에 해당하는 다이어리를 가져옴
    */
    async getDiaryById(id : number) {

      const diary = await this.diaryRepository
        .createQueryBuilder('diary')
        .leftJoinAndSelect('diary.category', 'category') // Diary → Category 관계 사용
        .leftJoinAndSelect('category.space', 'space') // Category → Space 관계 사용
        .leftJoinAndSelect('diary.user', 'user') // Diary → User 관계 사용
        .select([
          'space.name',  // alias 추가
          'category.name',
          'user.nickname',
          'diary.id',
          'diary.title',
          'diary.content',
          'diary.createdAt',
          'diary.updatedAt',
          'diary.likeCount',
          'diary.commentCount'
        ])
        .orderBy('diary.createdAt', 'ASC')
        .getRawMany();


        if(!diary){
          throw new NotFoundException();
        }
    
        return diary;
    }

    /** 
    * 다이어리 업로드
    * @param data userId, categoryId, title, content
    */
    async uploadDiary( userId: number, categoryId: string, diaryDto: CreateDiaryDto) {

      const diary = this.diaryRepository.create({
        user: {id: userId},
        category: {id: categoryId},
        ...diaryDto,
        likeCount: 0,
        commentCount: 0
      })

      const newDiary = await this.diaryRepository.save(diary);
          
          return newDiary;
    }

    /** 
    * 다이어리 수정
    * @param id title, content
    */
    async editDaiary(id:number, title:string, content:string) {

      //save의 기능
      // 1) 만약에 데이터가 존재하지 않는다면 (id 기준) 새로 생성한다
      // 1) 데이터가 존재한다면 존재하는 값을 업데이트 한다

      //DB에 데이터가 존재하는지 id로 검색
      const diary = await this.diaryRepository.findOne({ where: {id: id}})

      if(!diary){
          throw new NotFoundException();
      }

      diary.title = title;
      diary.content = content;

      await this.diaryRepository.update(id, { title, content });

      return await this.diaryRepository.findOne({ where: {id: id}})
    }

    /** 
    * 다이어리 삭제
    * @param id title, content
    */
    async deleteDiary(id: number) {
      const diary = await this.diaryRepository.findOne({ where: {id: id}})

      if(!diary){
        throw new NotFoundException();
      }

      this.diaryRepository.delete(id)

        // diarys = diarys.filter(diary => diary.id !== id)

      return id;
    }

}
