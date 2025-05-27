import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WrapperDataInterceptor } from './shared-module/interceptors/wrapper-data/wrapper-data.interceptor';
import { EntityValidationErrorFilter } from './shared-module/filters/entity-validation-error.filter';
import { NotFoundErrorFilter } from './shared-module/filters/not-found-error.filter';
import * as qs from 'qs';

export function applyGlobalConfigApp(app: INestApplication) {
  // Configura o Express para usar qs como parser de query string
  app
    .getHttpAdapter()
    .getInstance()
    .set('query parser', (str: string) => qs.parse(str));

  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: 422,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(
    new WrapperDataInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );
  app.useGlobalFilters(
    new EntityValidationErrorFilter(),
    new NotFoundErrorFilter(),
  );
}
