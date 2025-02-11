import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';
import { Request } from 'express';

@Injectable()
export class BearerTokenGuard implements CanActivate {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const rawToken = request.headers['authorization'];

        if (!rawToken) {
            throw new UnauthorizedException('토큰이 없습니다!');
        }

        const token = this.authService.extractTokenFromHeader(rawToken, true);
        const result = await this.authService.verifyToken(token);
        const user = await this.usersService.findUserByEmail(result.email);

        request.user = user;
        request.token = token;
        request.tokenType = result.type;

        return true;
    }
}

@Injectable()
export class AccessTokenGuard extends BearerTokenGuard {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        await super.canActivate(context);
        const request = context.switchToHttp().getRequest();

        if (request.tokenType !== 'access') {
            throw new UnauthorizedException('AccessToken이 아닙니다!');
        }
        return true;
    }
}

@Injectable()
export class RefreshTokenGuard implements CanActivate {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService
    ) {}

    // :Promise<boolean>
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const refreshToken = request.cookies?.refreshToken; // 쿠키에서 토큰 가져오기

        if (!refreshToken) {
            throw new UnauthorizedException('RefreshToken이 없습니다!');
        }

        const result = await this.authService.verifyToken(refreshToken); //토큰으로부터 이메일 가져오기
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
