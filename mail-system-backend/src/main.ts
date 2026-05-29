import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import dotenv from 'dotenv';
import { AppModule } from './app.module.js';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { IoAdapter } from '@nestjs/platform-socket.io';
import fastifyMultipart from '@fastify/multipart';
import fastifyCookie from '@fastify/cookie';

dotenv.config();

async function bootstrap() {
  // Cast adapter to bypass local package type duplication issues.
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter() as any,
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.register(fastifyCookie as any);

  await app.register(fastifyMultipart as any, {
    limits: {
      files: 10,
      fileSize: 10 * 1024 * 1024,
    },
  });

  app.useWebSocketAdapter(new IoAdapter(app));

  const frontendOrigin =
    process.env.FRONTEND_URL ?? 'http://localhost:3000';

  app.enableCors({
    origin: [frontendOrigin, 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT ?? 8080, '0.0.0.0');
  console.log(
    `Server running on http://localhost:${process.env.PORT ?? '8080'}`,
  );
}
bootstrap();
