import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from "cookie-parser";

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({ 
    origin: "http://localhost:3000", // Next.js URL 허용
    credentials: true, // ✅ CORS에서 쿠키 허용
  }); 

  await app.listen(8080);
}
bootstrap();