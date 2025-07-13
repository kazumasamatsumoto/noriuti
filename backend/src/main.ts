import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS設定
  app.enableCors({
    origin: ['http://localhost:4200'],
    credentials: true,
  });
  
  // グローバルバリデーション
  app.useGlobalPipes(new ValidationPipe());
  
  // 静的ファイル配信設定
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
