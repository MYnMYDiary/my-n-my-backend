import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DiaryModule } from './diary/diary.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiaryModel } from './diary/entities/diary.entity';
import { UsersModule } from './users/users.module';
import { UserModel } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    //인증번호를 저장해둘 메모리 기반 캐싱
    CacheModule.register({
      isGlobal: true, // 전역에서 사용 가능
      ttl: 1000 * 60 * 5, // 캐시 만료 시간 (초 단위, 5분)
      max: 1000, // 최대 캐시 개수
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      database: process.env.POSTGRES_DB,
      password: String(process.env.POSTGRES_PASSWORD),
      entities: [
        DiaryModel,
        UserModel,
      ],
      synchronize: true, //실제로 운영할 때는 false로 해야된다 안그러면 큰일난다!
    }),
    DiaryModule,
    UsersModule,
    AuthModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
