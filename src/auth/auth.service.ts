import { UsersService } from './../users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserModel } from 'src/users/entities/user.entity';
import { HASH_ROUNDS, JWT_SECREAT } from './const/auth.const';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    constructor(
        private readonly jwtService:JwtService,
        private readonly UsersService:UsersService,
    ){}

    /**
     * accessToken과 refreshToken을 sign하는 로직
     * 
     * Payload에 들어갈 정보
     * 1) email
     * 2) sub => id를 말한다. 이 상황에서는 사용자의 ID 이 값으로 사용자 정보를 DB에서 가져옴
     * 3) type : 'access' | 'refresh'
     */
    signToken(user: Pick<UserModel, 'email' | 'id' >, isRefreshToken:boolean ){
        const payload = {
            email: user.email,
            sub: user.id,
            type: isRefreshToken ? 'refresh' : 'access',
        }

        return this.jwtService.sign(payload, {
            secret: JWT_SECREAT,
            // refreshToken => 1시간
            // accessToekn => 5분
            expiresIn: isRefreshToken ? 3600 : 300,
        });
    }

    /**
     * 로그인 함수
     * : accessToken과 refreshToken을 반환하는 로직
     * @param user
     */
    loginUser( user: Pick<UserModel,'email'|'id' >) {
        return {
            accessToken: this.signToken(user, false),
            refreshToken: this.signToken(user, true),
        }
    }

    /**
     * 로그인 검증 함수 :
     * 로그인을 할 때 필요한 기본적인 검증 진행
     * 1) 사용자가 존재하는지 확인
     * 2) 비밀번호가 맞는지 확인
     * 3) 모두 통과되면 찾은 사용자 정보 반환
     * 4) loginWithEmail에서 반환한 데이터를 기반으로 토큰 생성
     */
    async validateLogin( user: Pick<UserModel,'email'|'password' > ){
  
        // 사용자가 존재하는지 확인(email)
        const findedUser = await this.UsersService.findUserByEmail(user.email)
        
        if(!findedUser){
            throw new UnauthorizedException('존재하지 않는 사용자입니다.')
        }

        // 비밀번호 확인
        // 1) 입력된 비밀번호
        // 2) 기존 hash
        const passOk = await bcrypt.compare(user.password, findedUser.password)

        if(!passOk){
            throw new UnauthorizedException('비밀번호가 올바르지 않습니다.')
        }

        // 찾은 사용자 정보 반환
        return findedUser;
    }

    /**
     * 이메일로 로그인
     * @param user
     * @returns accdssToken, refreshToken
     */
    async loginWithEmail( user: Pick<UserModel,'email'|'password' > ) {

        // 로그인 검증(email, password)으로 찾은 사용자
        const findedUser = await this.validateLogin(user);

        // 사용자의 accdssToken과 refreshToken 반환
        return this.loginUser(findedUser)
    }

    /**
     * 이메일로 회원가입
     */
    async joinWithEmail(user: Pick<UserModel,'email'|'password'|'nickname' > ){

        const hash = await bcrypt.hash(user.password, HASH_ROUNDS);

        const newUser = await this.UsersService.createUser({
            ...user,
            password: hash // 비밀번호는 해시로 저장
        });

        return this.loginUser(newUser);

    }

}
