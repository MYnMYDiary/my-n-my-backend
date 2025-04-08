import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { JWT_SECRET } from 'src/auth/const/auth.const';
import { UserModel } from 'src/users/entities/user.entity';

@Injectable()
export class JwtAuthService {
  constructor(private readonly jwtService: JwtService) {}


    /**
   * 새로운 토큰을 발급하는 함수
   * @param user 기존 유저의 email, id, tokenType
   * @param isRefreshToken true: refreshToken | false: accessToken
   * @returns accessToken(5분) | refreshToken(1시간)
   */
    signToken(user: Pick<UserModel, 'email' | 'id' >, isRefreshToken:boolean ){
      const payload = {
          email: user.email,
          sub: user.id, // sub => ID (JWT 표준 클레임) 이 상황에서는 사용자의 ID 이 값으로 사용자 정보를 DB에서 가져옴
          type: isRefreshToken ? 'refresh' : 'access',
      }

      return this.jwtService.sign(payload, {
          secret: JWT_SECRET,
          expiresIn: isRefreshToken ? 3600 * 24 * 7 : 60 * 30, // refreshToken => 7일 accessToekn => 30분
      });
  }

  /**
   * 헤더로 들어온 토큰을 추출하는 함수
   * @param header Basic {token} | Bearer {token}
   * @param isBearer true:'Bearer' false: 'Basic'
   * @returns BearerToken | AccessToken
   */
    extractTokenFromHeader(header:string, isBearer:boolean){
      const splitToken = header.split(' ');
      const prefix = isBearer ? 'Bearer' : 'Basic';

      if(splitToken.length !== 2 || splitToken[0] !== prefix ){
          throw new UnauthorizedException('잘못된 토큰입니다.');
      }
      const token = splitToken[1];

      return token;
  }


  /**
   * 토큰 검증
   * @param token 토큰
   * @returns 토큰 검증 결과
   */
  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {secret: JWT_SECRET})
  } catch (error) {
      if (error instanceof TokenExpiredError) {
          // 기본적으로 401에러 반환
          throw new UnauthorizedException('RefreshToken이 만료되었습니다. 다시 로그인하세요');
      }
      if (error instanceof JsonWebTokenError) {
          throw new UnauthorizedException('유효하지 않은 RefreshToken입니다.');
      }
      throw new UnauthorizedException('토큰 검증 중 오류가 발생했습니다.');
  }
  }

    /**
     * 토큰을 재발급
     * @param token 
     * @param isRefreshToken 
     * @returns true => refreshToken, false => accessToken
     */
    rotateToken(token:string, isRefreshToken: boolean){
      const decoded = this.jwtService.verify(token, {secret:JWT_SECRET});

      if(decoded.type != 'refresh'){
          throw new UnauthorizedException('토큰 재발급은 refreshToken으로만 가능합니다.');
      }

      return this.signToken({...decoded},isRefreshToken);
  }
} 