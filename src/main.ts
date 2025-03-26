import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  /**
   * - 쿠키 파서 미들웨어를 등록하는 코드
   * - 클라이언트에서 보내는 쿠키를 파싱하여 req.cookies 객체로 변환해줌
   * - 요청에 포함된 쿠키를 쉽게 읽고 조작할 수 있게 해줌
   */
  app.use(cookieParser());


  /**
   * CORS(Cross-Origin Resource Sharing) 설정을 활성화
   * 다른 도메인에서의 API 요청을 허용하기 위한 보안 설정
   * 프론트엔드에서는 axios 나 fetch 사용 시 withCredentials: true 설정이 필요
   */
  app.enableCors({ 
    origin: "http://localhost:3000", // Next.js 프론트엔드 애플리케이션의 URL을 지정
    credentials: true, // 크로스 도메인 요청에서 쿠키 전송을 허용
  }); 
  

  // 앱 전체에서 validation 사용 가능
  app.useGlobalPipes(new ValidationPipe({
    transform: true, // 클라이언트에서 받은 데이터를 DTO에 정의된 타입으로 자동 변환
    transformOptions: {
      enableImplicitConversion: true, //DTO에서 정의한 타입으로 자동 형변환
    },
  }))

  await app.listen(8080);
}
bootstrap();