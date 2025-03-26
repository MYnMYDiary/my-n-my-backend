import { join } from "path";

/**
 * `http://`
 */
export const PROTOCOL = 'http://';

/**
 * `localhost:8080`
 */
export const HOST = 'localhost:8080';

/**
 * /Users/soyeon/dev/workspace/MYnMY/Back
 * @description 프로젝트 루트 폴더
 */
export const PATH_PROJECT_ROOT = process.cwd();

export const PATH_PUBLIC = 'public';
export const PATH_DIARY_IMAGE = 'diary';
export const PATH_TEMP = 'temp'
export const PATH_PROFILE = 'profile'
/**
 * {project-path} /public
 * @description 절대경로
 */
export const PUBLIC_FOLDER_PATH = join(PATH_PROJECT_ROOT, PATH_PUBLIC);

/**
 * {project-path}/public/diary
 * @description 절대경로
 */
export const DIARY_IMAGE_PATH = join(PUBLIC_FOLDER_PATH, PATH_DIARY_IMAGE);

/**
 * {project-path} /public/temp
 * @description  절대경로: 임시 파일들을 저장할 폴더
 */
export const TEMP_FOLDER_PATH = join(PUBLIC_FOLDER_PATH, PATH_TEMP);

/**
 * {project-path}/public/profile
 * @description 절대경로: 프로필 이미지 저장 폴더
 */
export const PROFILE_IMAGE_PATH = join(PUBLIC_FOLDER_PATH, PATH_PROFILE);
