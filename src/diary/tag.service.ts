import { Injectable } from "@nestjs/common";
import { TagModel } from "./entities/tag.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class TagService {
    constructor(
        @InjectRepository(TagModel)
        private tagRepository: Repository<TagModel>,
    ) {}

    /**
     * 태그 생성 또는 업데이트
     * @param tagNames 태그 이름 배열
     * @returns 생성된 태그 배열
     */
    async createOrUpdateTags(tagNames: string[]): Promise<TagModel[]> {
        const tags = [];
        if (tagNames) {
            for (const tagName of tagNames) {
                const result = await this.tagRepository
                    .createQueryBuilder()
                .insert()
                .into('Tag')
                .values({ name: tagName, count: 1 })
                .onConflict(`("name") DO UPDATE SET count = EXCLUDED.count + 1`)
                .returning('*')
                .execute();
                
            tags.push(result.raw[0]);
            }
        }
        
        return tags;
      }

    /**
     * 태그 조회
     * @param tagName 태그 이름
     * @returns 검색된 태그 배열
     */
    async findTag(tagName: string) {
        const tags = await this.tagRepository
            .createQueryBuilder('tag')
            .select('tag.name')
            .where('tag.name ILIKE :tagName', { tagName: `${tagName}%` })
            .orderBy('tag.name', 'ASC')

        console.log('실행될 쿼리:', tags.getSql()); // 실제 SQL 쿼리 확인
        console.log('쿼리 파라미터:', tags.getParameters());
        
        return tags.getMany();
    }
}