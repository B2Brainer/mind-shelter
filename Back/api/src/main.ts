import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);
  const frontendOrigins = configService.get<string[]>('app.frontendOrigins', [
    'http://localhost:5173',
    'http://localhost:8080',
  ]);

  app.enableCors({
    origin: frontendOrigins,
    credentials: true,
  });

  const port = configService.get<number>('app.port', 3001);
  await app.listen(port);

  console.log(`Mind Shelter API running on http://localhost:${port}`);
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start Mind Shelter API', error);
  process.exit(1);
});
