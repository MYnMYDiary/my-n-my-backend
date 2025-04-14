import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from './entities/user.entity';
import { Repository } from 'typeorm';
import { join } from 'path';
import { PROFILE_IMAGE_PATH } from 'src/common/const/path.const';
import * as fs from 'fs';
import { DEFAULT_USER_SELECTIONS } from './const/userQuery.const';
import { UserRole } from './const/user.const';
import { MarketModel } from 'src/market/entities/market.entity';


@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(UserModel)
        private readonly userRepository: Repository<UserModel>,
        @InjectRepository(MarketModel)
        private readonly marketRepository: Repository<MarketModel>
    ) {}

    /**
     * 유저 생성
     * @param user 유저 정보
     * @returns 생성된 유저 정보
     */
    async createUser( user: Pick<UserModel,'email'|'password'|'nickname' >) {

        //nickname과 email이 중복되지 않는지 확인
        const nicknameExist = await this.userRepository.exists({where: {nickname:user.nickname}});
        const emailExist = await this.userRepository.exists({where: {email:user.email}});

        if(nicknameExist){
            throw new BadRequestException('이미 존재하는 닉네임 입니다.');
        }

        if(emailExist){
            throw new BadRequestException('이미 가입한 이메일 입니다.');
        }


        const userObj = this.userRepository.create(user);
        const newUser = this.userRepository.save(userObj);

        return newUser;
    }

        /**
     * 내 정보 조회
     * @param userId 유저 아이디
     * @returns 유저 정보
     */
    async getMyInfo(userId: number, userRole: UserRole) {
        if(userRole === UserRole.USER){
            const user = await this.userRepository.createQueryBuilder('user')
                .select([...DEFAULT_USER_SELECTIONS])
                .where('user.id = :userId', { userId })
                .getRawOne();

            return user;
        }

        if(userRole === UserRole.ARTIST){
            const user = await this.userRepository
            .createQueryBuilder('user')
            .select([...DEFAULT_USER_SELECTIONS])
            .where('user.id = :userId', { userId })
            .getRawOne();

            const market = await this.marketRepository
            .createQueryBuilder('market')
            .select('market.id', 'id')
            .where('market.userId = :userId', { userId })
            .getRawOne();

            const userInfo = {...user, market: market.id}

            return userInfo;
        }
    }

    /**
     * 이메일로 사용자 검색
     * @param email
     * @returns user = {id, email, nickname, password, role, updatedAt, createdAt }
     */
    async findUserByEmail( email: string ) {
        return this.userRepository.findOne({ where: { email }})
    }

    /**
     * 프로필 이미지 업로드
     * @param file 업로드된 이미지 파일
     * @returns 업로드된 이미지 파일 경로
     */
    async uploadProfileImage(userId: number, fileName: string) {
        const user = await this.userRepository.findOne({ where: { id: userId }});

        if(!user){
            throw new NotFoundException('존재하지 않는 유저입니다.');
        }

        //기존 프로필 이미지가 있으면 삭제
        if(user.profileImage){
            const imagePath = join(PROFILE_IMAGE_PATH, user.profileImage);
            
            // 파일이 존재하는지 확인 후 삭제
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        user.profileImage = fileName;

        await this.userRepository.update(userId, { profileImage: fileName });

        return await this.userRepository.findOne({ where: { id: userId }});
    }



}
