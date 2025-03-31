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
}