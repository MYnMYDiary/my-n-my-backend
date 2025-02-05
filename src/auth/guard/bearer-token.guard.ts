import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';

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
    constructor(private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const refreshToken = request.cookies?.refreshToken; // 쿠키에서 토큰 가져오기

        if (!refreshToken) {
            throw new UnauthorizedException('RefreshToken이 없습니다!');
        }

        const result = await this.authService.verifyToken(refreshToken);

        if (result.type !== 'refresh') {
            throw new UnauthorizedException('RefreshToken이 아닙니다!');
        }

        request.user = result; // 유저 정보 저장 (email 포함)
        request.tokenType = result.type;

        return true;
    }
}
