import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";
import { UserModel } from "../entities/user.entity";

/**
 * 커스텀 데코레이터 User
 * @returns user
 */
export const User = createParamDecorator((data: keyof UserModel | undefined, context:ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserModel;

    if(!user){
        throw new InternalServerErrorException('request에 user 프로퍼티가 존재하지 않습니다');
    }

    if(data){ 
        return user[data];
    }

    return user;
})