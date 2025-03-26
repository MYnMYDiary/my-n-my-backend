import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { DiaryModel } from './entities/diary.entity';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { plainToInstance } from 'class-transformer';
import { basename, join } from 'path';
import { DIARY_IMAGE_PATH, HOST, PROTOCOL, PUBLIC_FOLDER_PATH, TEMP_FOLDER_PATH } from 'src/common/const/path.const';
import { promises } from 'fs';
import { PaginateDiaryDto } from './dto/pagenate-diary.dto';
import { DiaryQuery } from './queries/diary.query';

@Injectable()
export class DiaryService {

  constructor(
    @InjectRepository(DiaryModel)
    private readonly diaryRepository: Repository<DiaryModel>,
    private readonly diaryQuery: DiaryQuery
  ) {}
  
  pagenation(data: any, page: PaginateDiaryDto, url: string){
    
    const lastdata = data.length > 0 ? data[data.length - 1] : null; // 마지막 데이터
    const nextUrl = lastdata && new URL(`${PROTOCOL}${HOST}${url}`); // 다음 페이지

    if(nextUrl){
      // query의 키값들을 루핑하면서 키값에 해당하는 value가 존재하면 param에 추가
      // 단, id_gt 값만 latstDiary의 마지막 값으로 넣어준다
      for(const key of Object.keys(page)){
        if(key !== 'id_gt'){
          nextUrl.searchParams.append(key, page[key as keyof PaginateDiaryDto]);
        }
      }
      nextUrl.searchParams.append('id_gt', lastdata.id.toString());
    }

    return { 
      data: plainToInstance(DiaryModel, data), 
      cursor: {
        after: lastdata?.id,
      },
      count: data.length,
      next: nextUrl?.toString()
    };
  }

  /** 
   * 모든 다이어리를 다 가져옴
  */
  async getAllDiary(page: PaginateDiaryDto, categoryId: string) {
    const data = await this.diaryQuery.findAllDiaries(page, categoryId);
    return this.pagenation(data, page, '/diary');
  }

  /** 
   * 다이어리 id에 해당하는 다이어리를 가져옴(상세보기)
  */
  async getDiaryById(id : number) {
    const data = await this.diaryQuery.findDiaryById(id);

    if(!data){
      throw new NotFoundException();
    }

    return data;
  }

  /** 
  * 다이어리 업로드
  * @param data userId, categoryId, title, content
  */
  async uploadDiary( userId: number, diaryDto: CreateDiaryDto) {

    const diary = this.diaryRepository.create({
      user: {id: userId},
      category: {id: diaryDto.categoryId},
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

    
  /**
   * 유저 아이디에 해당하는 다이어리를 가져옴
   * @param userId 유저 아이디
   * @param categoryId 카테고리 아이디
   * @returns 유저 아이디에 해당하는 다이어리
   */
  async getMyDiary(userId: number, categoryId: string, page: PaginateDiaryDto) {
    const data = await this.diaryQuery.findMyDiary(userId, categoryId, page);
    return this.pagenation(data, page, '/diary/mydiary');
  }



    /**
     * 다이어리 페이지네이션
     * @param query 페이지네이션 쿼리
     * @param categoryId 카테고리 아이디
     * @returns 페이지네이션 다이어리
     */
    async paginateDiaries(query: PaginateDiaryDto, categoryId: string) {

      const diary = await this.diaryRepository
        .createQueryBuilder('diary')
        .leftJoinAndSelect('diary.category', 'category')
        .leftJoinAndSelect('category.space', 'space')
        .leftJoinAndSelect('diary.user', 'user')
        .select([
          'space.name',
          'category.name',
          'user.nickname',
          'diary.id',
          'diary.title',
          "CONCAT('/public/diary/', diary.image) AS \"diaryImage\"",
          'diary.content',
          'diary.likeCount AS \"likeCount\"',
          'diary.commentCount AS "\commentCount\"',
          "to_char(diary.createdAt AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul', 'YYYY.MM.DD HH24:MI') AS \"createdAt\"",
        ])
        .where('space.id = :id', { id: 'D' })
        .andWhere('category.id = :categoryId', { categoryId: categoryId })
        .andWhere('diary.id > :id_gt', { id_gt: Number(query.id_gt) || 0 })
        .orderBy(`diary.${query.sort}`, query.order)
        .limit(query.limit)
        .getRawMany();

        // 마지막 다이어리 조회
        const lastDiary = diary.length > 0 ? diary[diary.length - 1] : null;
        const nextUrl = lastDiary && new URL(`${PROTOCOL}${HOST}/diary`);

        if(nextUrl){
          // query의 키값들을 루핑하면서 키값에 해당하는 value가 존재하면 param에 추가
          // 단, where__id_more_than 값만 latstDiary의 마지막 값으로 넣어준다
          for(const key of Object.keys(query)){
            if(key !== 'id_gt'){
              nextUrl.searchParams.append(key, query[key as keyof PaginateDiaryDto]);
            }
          }
          nextUrl.searchParams.append('id_gt', lastDiary.diary_id.toString());
        }

      return { 
        data: plainToInstance(DiaryModel, diary), 
        cursor: {
          after: lastDiary?.diary_id,
        },
        count: diary.length,
        next: nextUrl?.toString()
      };
    }


    /**
     * 테스트 값 생성
     */
    async generateDiary(userId: number){
      for(let i = 0; i < 100; i++){
        const diary = this.diaryRepository.create({
          user: {id: userId},
          category: {id: '001'},
          title: `다이어리 ${i}`,
          content: `다이어리 ${i} 내용`,
          image: `다이어리 ${i} 이미지`,
          likeCount: 0,
          commentCount: 0
        })
        await this.diaryRepository.save(diary);
      }
    }
    
}
