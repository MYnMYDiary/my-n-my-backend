
/**
 * 기본 유저 조회 컬럼
 * @constant `user.id` 유저 아이디
 * @constant `user.nickname` 유저 닉네임
 * @constant `user.email` 유저 이메일
 * @constant `user.role` 유저 역할
 * @constant `user.createdAt` 유저 생성일
 * @constant `user.updatedAt` 유저 수정일
 * @constant `user.profileImage` 유저 프로필 이미지 경로
 */
export const DEFAULT_USER_SELECTIONS = [
    'user.id AS id',
    'user.nickname AS nickname',
    'user.email AS email',
    'user.role AS role',
    "to_char(user.createdAt AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul', 'YYYY.MM.DD HH24:MI') AS createdAt",
    "to_char(user.updatedAt AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul', 'YYYY.MM.DD HH24:MI') AS updatedAt",
    "CONCAT('/public/profile/', user.profileImage) AS profileimage",
  ] as const;