import { UsersService } from './../users/users.service';
import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { UserModel } from 'src/users/entities/user.entity';
import { HASH_ROUNDS, JWT_SECRET } from './const/auth.const';
import * as bcrypt from 'bcrypt';
import {Transporter} from 'nodemailer';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Response } from 'express';
import { JwtAuthService } from 'src/common/jwt/jwt.service';


@Injectable()
export class AuthService {

    private transporter : Transporter;

    constructor(
        private readonly jwtService:JwtService,
        private readonly usersService:UsersService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly jwtAuthService: JwtAuthService
    ){}


    /**
     * 로그인 함수
     * @param {UserModel} user
     * @return accessToken, refreshToken
     */
    loginUser( user: Pick<UserModel,'email'|'id' >, res: Response) {

        const accessToken = this.jwtAuthService.signToken(user, false);
        const refreshToken = this.jwtAuthService.signToken(user, true);

        // ✅ Refresh Token을 HttpOnly 쿠키로 설정
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, // 보안 강화 (JavaScript 접근 불가능)
            // secure: false, // 로컬 개발에서는 false
            secure: process.env.NODE_ENV === 'production', // HTTPS에서만 사용
            sameSite: 'strict', // CSRF 보호
            path: '/', // 모든 경로에서 사용 가능
        });

        // console.log(res.getHeader('set-cookie'));

        return res.json({accessToken: accessToken}) // @Res()를 사용하는 경우, return res.json(...)을 반환하지 않으면 응답이 중단되고 무한 로딩 발생할 수 있음.
    }

    /**
     * 로그인을 할 때 필요한 기본적인 검증 진행
     * 1) 사용자가 존재하는지 확인
     * 2) 비밀번호가 맞는지 확인
     * 3) 모두 통과되면 찾은 사용자 정보 반환
     * 4) loginWithEmail에서 반환한 데이터를 기반으로 토큰 생성
     */
    async validateLogin( user: Pick<UserModel,'email'|'password' > ){
  
        // 사용자가 존재하는지 확인(email)
        const findedUser = await this.usersService.findUserByEmail(user.email)
        
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
    async loginWithEmail( user: Pick<UserModel,'email'|'password' >, res: Response ) {

        // 로그인 검증(email, password)으로 찾은 사용자
        const findedUser = await this.validateLogin(user);

        // 사용자의 accessToken과 refreshToken 반환
        return await this.loginUser(findedUser, res)
    }

    /**
     * 이메일로 회원가입
     */
    async joinWithEmail(user: Pick<UserModel,'email'|'password'|'nickname' >, res: Response ){
        const hash = await bcrypt.hash(user.password, HASH_ROUNDS); // 비밀번호 암호화

        const isVerified = await this.cacheManager.get<string>(user.email);

        if (isVerified == null || isVerified == undefined) {
            throw new NotFoundException('인증하기 안함.');
        }

        if(isVerified && isVerified != "true"){
            throw new NotFoundException('인증되지 않았습니다.');
        }

        const newUser = await this.usersService.createUser({
            ...user,
            password: hash, // 비밀번호는 해시로 저장
        });

        return await this.loginUser(newUser, res);

    }

}
