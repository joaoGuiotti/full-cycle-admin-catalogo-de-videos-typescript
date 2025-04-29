import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { applyGlobalConfigApp } from './nest-modules/global.config';
import { applySwaggerConfig } from './nest-modules/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      // Configure cors to allow all origins
      origin: '*'
    }
  });
  
  applyGlobalConfigApp(app);
  
  applySwaggerConfig(app);

  await app.listen(process.env.PORT ?? 3000)
}

bootstrap();
