import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiaryModel } from './entities/diary.entity';
import { UserModel } from 'src/users/entities/user.entity';

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
        .leftJoinAndSelect('diary.user', 'user') // 관계가 설정된 경우
        .select([
          'diary.id',
          'diary.title',
          'diary.content',
          'user.nickname', // user 테이블의 nickname 가져오기
          'diary.createdAt',
        ])
        .orderBy('diary.createdAt', 'ASC')
        .getMany();
    }

    /** 
     * id에 해당하는 다이어리를 가져옴
    */
    async getDiaryById(id : number) {

      const diary = await this.diaryRepository.findOne({
        relations: ['nickname'],
        where: {
          id:id,
        }
      })

        if(!diary){
          throw new NotFoundException();
        }
    
        return diary;
    }

    /** 
    * 다이어리 업로드
    * @param data data.title, data.content
    */
    async uploadDiary( userId: number, title: string, content:string) {

      const diary = this.diaryRepository.create({
        user: {id: userId},
        title,
        content,
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
