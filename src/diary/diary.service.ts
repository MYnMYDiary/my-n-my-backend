import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiaryModel } from './entities/diary.entity';
import { UserModel } from 'src/users/entities/user.entity';
import { CategoryModel } from './entities/category.entity';
import { SpaceModel } from './entities/space.entity';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { plainToInstance } from 'class-transformer';
import { basename, join } from 'path';
import { DIARY_IMAGE_PATH, PUBLIC_FOLDER_PATH, TEMP_FOLDER_PATH } from 'src/common/const/path.const';
import { promises } from 'fs';

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

      const rawData = this.diaryRepository
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
        "CONCAT('/public/diary/', diary.image) AS diary_image",
        'diary.content',
        'diary.createdAt',
      ])
      .where('space.id = :id', { id: 'DAKU' }) // category.id가 'DAKU'인 데이터만 필터링
      .orderBy('diary.createdAt', 'ASC')
      .getRawMany(); // 특정 필드만 선택했으므로 getRawMany() 사용

      return plainToInstance(DiaryModel, rawData);
    }

    /** 
     * 다이어리 id에 해당하는 다이어리를 가져옴
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
          "CONCAT('/public/diary/', diary.image) AS diary_image",
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
    * @param id
    * @param title
    * @param content
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


    /**
     * `diary.image`의 이미지 경로: `public/temp`에서 이미지파일을 찾고 이미지가 존재하면 이미지의 경로를  `/public/diary`로 변경해준다
     * @param diary
     * @throws {BadRequestException} 존재하지 않는 파일 입니다.
     */
    async createDiaryImage(diary: CreateDiaryDto){
      //dto의 이미지 이름을 기반으로 파일의 경로 생성
      const tempFilePath = join(TEMP_FOLDER_PATH, diary.image) // => {project-path}/public/temp/~

      try {
        await promises.access(tempFilePath); //파일이 존재하는지 확인
      } catch (error) {
        throw new BadRequestException('존재하지 않는 파일 입니다.');
      }

      const fileName = basename(tempFilePath); // 파일의 이름만 가져오기
      const newPath = join(DIARY_IMAGE_PATH,fileName) // {project-path}/public/diary/~

      await promises.rename(tempFilePath, newPath); // temp -> diary

      return true;
    }
    
    async getDiaryByUser(userId: number, categoryId: string) {
      const query = this.diaryRepository
        .createQueryBuilder('diary')
        .leftJoinAndSelect('diary.category', 'category') // Diary → Category 관계 사용
        .leftJoinAndSelect('category.space', 'space') // Category → Space 관계 사용
        .leftJoinAndSelect('diary.user', 'user') // Diary → User 관계 사용
        .select([
          'space.name AS space_name',  
          'category.name AS category_name',
          'user.nickname AS user_nickname',
          'diary.id AS diary_id',
          'diary.title AS diary_title',
          "CONCAT('/public/diary/', diary.image) AS diary_image",
          'diary.createdAt AS diary_createdAt',
        ])
        .where('space.id = :spaceId', { spaceId: 'DAKU' }) // space.id가 'DAKU'인 데이터 필터링
        .andWhere('user.id = :userId', { userId: Number(userId) }) // userId 필터링
        .orderBy('diary.createdAt', 'ASC');
    
      // ✅ categoryId가 존재할 경우에만 조건 추가
      if (categoryId) {
        query.andWhere('category.id = :categoryId', { categoryId: categoryId});
      }
    
      const rawData = await query.getRawMany(); // 특정 필드만 선택했으므로 getRawMany() 사용
    
      return plainToInstance(DiaryModel, rawData);
    }
    
}
