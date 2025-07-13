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
  
  // JSON レスポンスの文字エンコーディング設定
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // グローバルバリデーション
  app.useGlobalPipes(new ValidationPipe());
  
  // 静的ファイル配信設定
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
