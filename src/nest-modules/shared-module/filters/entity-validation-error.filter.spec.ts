import { Entity } from '@core/shared/domain/entity';
import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { EntityValidationErrorFilter } from './entity-validation-error.filter';

class StubEntity extends Entity {
  entity_id: any;
  toJSON(): Required<any> {
    return {}
  }
}

@Controller('stub')
class StubController {
  @Get()
  index() {
    throw new EntityValidationError([
      'another error',
      {
        field1: ['field1 is required', 'error 2'],
      },
      {
        field2: ['field2 is required'],
      }
    ]);
  }
}

describe('NotFoundErrorFilter Unit Test', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      controllers: [StubController]
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new EntityValidationErrorFilter());
    await app.init();
  })

  it('should catch a EntityValidationErrorFilter', () => {
    return request(app.getHttpServer())
      .get('/stub')
      .expect(422)
      .expect({
        statusCode: 422,
        error: 'Unprocessable Entity',
        message: [
          'another error',
          'field1 is required',
          'error 2',
          'field2 is required'
        ]
      })
  });
});
