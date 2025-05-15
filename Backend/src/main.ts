import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { createApp } from './app.create';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  createApp(app);

  app.use(cookieParser());

  app.enableCors({
    origin: ['http://localhost:5173', 'https://your-clerk-frontend.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Clerk-Session'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
