import { tokTypes } from './../../../node_modules/acorn/dist/acorn.d';
import { Observable } from 'rxjs';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';

// implements CanActivate - NestJS의 가드(Guard) 시스템을 활용하여 요청을 보호하는 클래스를 만들 때 사용하는 인터페이스. 
// 즉, implements CanActivate를 사용하면 해당 클래스가 NestJS의 가드로 동작해야 한다는 것을 보장할 수 있다


@Injectable()
export class BearerTokenGuard implements CanActivate{

    constructor( 
        private readonly authService:AuthService,
        private readonly usersService:UsersService
    ){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const rawToken = request.headers['authorization'];

        if(!rawToken){
            throw new UnauthorizedException('토큰이 없습니다!');
        }

        const token = this.authService.extractTokenFromHeader(rawToken, true);
        const result = await this.authService.verifyToken(token);
        const user = await this.usersService.findUserByEmail(result.email);


        request.user = user;
        request.token = token;
        request.tokenType = result.type;

        return true
    }
}

@Injectable()
export class AccessTokenGuard extends BearerTokenGuard {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        await super.canActivate(context);
        const request = context.switchToHttp().getRequest();

        if(request.tokenType !== 'access'){
            throw new UnauthorizedException('accessToken이 아닙니다');
        }
        return true;
    }
}

@Injectable()
export class RefreshTokenGuard extends BearerTokenGuard {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        await super.canActivate(context);
        const request = context.switchToHttp().getRequest();

        if(request.tokenType !== 'refresh'){
            throw new UnauthorizedException('refreshToken이 아닙니다');
        }
        return true;
    }
}