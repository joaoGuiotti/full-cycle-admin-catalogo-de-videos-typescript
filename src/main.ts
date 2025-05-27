import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { applyGlobalConfigApp } from './nest-modules/global.config';
import { applySwaggerConfig } from './nest-modules/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'production' ? console : undefined,
  });

  applyGlobalConfigApp(app);

  applySwaggerConfig(app);

  await app.listen(process.env.PORT ?? 3000)
}

bootstrap();
