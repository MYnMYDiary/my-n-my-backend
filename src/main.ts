import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({ 
    origin: "http://localhost:3000", // Next.js URL 허용
    credentials: true, // ✅ CORS에서 쿠키 허용
  }); 

  app.useGlobalPipes(new ValidationPipe()) // 앱 전체에서 validation 사용 가능

  await app.listen(8080);
}
bootstrap();