import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtAuthService } from '../jwt/jwt.service';

@Injectable()
export class AccessTokenGuard implements CanActivate {
    constructor(
        private readonly jwtAuthService: JwtAuthService,
        private readonly usersService: UsersService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const rawToken = req.headers['authorization'];

        if (!rawToken) {
            throw new UnauthorizedException('토큰이 없습니다.');
        }

        const token = this.jwtAuthService.extractTokenFromHeader(rawToken, true);

        try {
            const payload = this.jwtAuthService.verifyToken(token);
            const user = await this.usersService.findUserByEmail(payload.email);
            req.user = user;
            return true;
        } catch (e) {
            throw new UnauthorizedException('유효하지 않은 토큰입니다.');
        }
    }

    private extractTokenFromHeader(header: string) {
        const splitToken = header.split(' ');
        if (splitToken.length !== 2 || splitToken[0] !== 'Bearer') {
            throw new UnauthorizedException('잘못된 토큰입니다.');
        }
        return splitToken[1];
    }
}

@Injectable()
export class RefreshTokenGuard implements CanActivate {
    constructor(
        private readonly jwtAuthService: JwtAuthService,
        private readonly usersService: UsersService
    ) {}

    // :Promise<boolean>
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const refreshToken = request.cookies?.refreshToken; // 쿠키에서 토큰 가져오기

        if (!refreshToken) {
            throw new UnauthorizedException('RefreshToken이 없습니다!');
        }

        const result = await this.jwtAuthService.verifyToken(refreshToken); //토큰으로부터 이메일 가져오기
        const user = await this.usersService.findUserByEmail(result.email); // 가져온 이메일로 사용자 정보 조회

        if (result.type !== 'refresh') {
            throw new UnauthorizedException('RefreshToken이 아닙니다!');
        }

        request.user = user; // 유저 정보 저장 (email 포함)
        request.tokenType = result.type;

        // return true
        return request.user;
    }
}
