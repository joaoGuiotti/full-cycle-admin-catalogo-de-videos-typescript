import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { WrapperDataInterceptor } from './nest-modules/shared-module/interceptors/wrapper-data/wrapper-data.interceptor';
import { NotFoundErrorFilter } from './nest-modules/shared-module/filters/not-found-error.filter';
import { EntityValidationErrorFilter } from './nest-modules/shared-module/filters/entity-validation-error.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      // Configure cors to allow all origins
      origin: '*'
    }
  });
  app.useGlobalPipes(new ValidationPipe({ errorHttpStatusCode: 422, }));
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new WrapperDataInterceptor()
  );
  app.useGlobalFilters(
    new NotFoundErrorFilter(),
    new EntityValidationErrorFilter()
  );

  const config = new DocumentBuilder()
    .setTitle('Admin do Catalogo(Full Cycle)')
    .setDescription('The admin of catalog API')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, documentFactory, {
    jsonDocumentUrl: 'swagger/json',
  });

  await app.listen(process.env.PORT ?? 3000)
}

bootstrap();
