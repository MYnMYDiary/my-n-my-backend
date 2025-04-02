import { AuthService } from "../auth.service";
import { UsersService } from "src/users/users.service";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

/**
 * 선택적 토큰 검증 가드 :로그인 하지 않은 사용자도 접근 가능한 경우에 사용
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
        private readonly authService: AuthService,
        private readonly usersService: UsersService
    ) {}

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const refreshToken = request.cookies?.refreshToken;

        // 토큰이 없으면 그냥 통과 (에러 발생하지 않음)
        if (!refreshToken) {
            return true;
        }

        try {
            const result = await this.authService.verifyToken(refreshToken);
            const user = await this.usersService.findUserByEmail(result.email);

            // 토큰 타입이 refresh가 아니어도 그냥 통과
            if (result.type !== 'refresh') {
                return true;
            }

            request.user = user;
            request.tokenType = result.type;
            
            return true;
        } catch (error) {
            // 토큰 검증 실패해도 그냥 통과
            return true;
        }
    }
}