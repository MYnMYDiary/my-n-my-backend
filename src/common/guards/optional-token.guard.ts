import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtAuthService } from '../jwt/jwt.service';

/**
 * 로그인/비로그인 사용자 검증
 * 
 * 토큰이 없으면 - 그냥 통과 (에러 발생하지 않음)
 * 
 * 토큰이 있으면 - 검증 후 유저 정보 추가
 * 
 * 
 */

@Injectable()
export class OptionalBearerTokenGuard implements CanActivate {
  constructor(
    private readonly jwtAuthService: JwtAuthService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const rawToken = req.headers['authorization'];

    if (!rawToken) {
      return true;
    }

    const token = this.extractTokenFromHeader(rawToken);

    try {
      const payload = this.jwtAuthService.verifyToken(token);
      const user = await this.usersService.findUserByEmail(payload.email);
      req.user = user;
    } catch (e) {
      // 토큰이 유효하지 않아도 에러를 던지지 않음
    }

    return true;
  }

  private extractTokenFromHeader(header: string) {
    const splitToken = header.split(' ');
    return splitToken[1];
  }
}