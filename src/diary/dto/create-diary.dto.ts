import { IsString } from "class-validator";
import { DiaryModel } from "../entities/diary.entity";
import { PickType } from "@nestjs/mapped-types";

/**
 * @property {string} `title`
 * @property {string} `content`
 * @property {string} `image`
 * @extends DiaryModel
 */
export class CreateDiaryDto extends PickType(DiaryModel, ['title', 'content', 'image']){}