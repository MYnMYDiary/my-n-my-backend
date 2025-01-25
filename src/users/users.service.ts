import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(UserModel)
        private readonly userRepository: Repository<UserModel>
    ) {}

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
     * 이메일로 사용자 검색
     * @param email
     * @returns 
     */
    async findUserByEmail( email: string ) {
        return this.userRepository.findOne({ where: { email }})
    }


}
