
/**
 * 기본 다이어리 조회 컬럼
 * @constant `space.name` 최상위카테고리 이름
 * @constant `category.name` 카테고리 이름
 * @constant `user.nickname` 작성자 닉네임
 * @constant `diary.id` 다이어리 아이디
 * @constant `diary.title` 다이어리 제목
 * @constant `diary_image` 다이어리 이미지 경로
 * @constant `createdAt` 다이어리 생성일
 * @constant `updatedAt` 다이어리 수정일
 */
export const DEFAULT_DIARY_SELECTIONS = [
    'space.name AS space',
    'category.name AS category', 
    'user.nickname AS user',
    'diary.id AS id',
    'diary.title AS title',
    "CONCAT('/public/diary/', diary.image) AS diary_image",
    "to_char(diary.createdAt AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul', 'YYYY.MM.DD HH24:MI') AS createdAt",
    "to_char(diary.updatedAt AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul', 'YYYY.MM.DD HH24:MI') AS updatedAt",
    'diary.likeCount AS likeCount',
    'diary.commentCount AS commentCount'
  ] as const;