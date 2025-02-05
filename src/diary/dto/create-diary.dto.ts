import { IsString } from "class-validator";
import { DiaryModel } from "../entities/diary.entity";
import { PickType } from "@nestjs/mapped-types";

export class CreateDiaryDto extends PickType(DiaryModel, ['title', 'content']){}