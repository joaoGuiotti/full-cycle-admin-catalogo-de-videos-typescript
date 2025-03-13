import { CategoryOutputMapper } from "@core/category/application/use-cases/common/category-output";
import { Category } from "@core/category/domain/category.entity";
import { ICategoryRepository } from "@core/category/domain/category.repository";
import { Uuid } from "@core/shared/domain/value-objects/uuid.vo";
import { instanceToPlain } from "class-transformer";
import { CategoriesController } from "src/nest-modules/categories-modules/categories.controller";
import { CATEGORY_PROVIDERS, REPOSITORIES } from "src/nest-modules/categories-modules/categories.provider";
import { GetCategoryFixture, UpdateCategoryFixture } from "src/nest-modules/categories-modules/testing/category-fixture";
import { startApp } from "src/nest-modules/shared-module/testing/helper";
import request from 'supertest';

describe('CategoiesController (e2e)', () => {
  describe('/categories/:id (PATCH)', () => {
    const uuid = '9366b7dc-2d71-4799-b91c-c64adb205104';

    describe('Should response error 422 when is a invalid id', () => {
      const nestApp = startApp();
      const faker = Category.fake().aCategory();
      const arrange = [
        {
          id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          send_data: { name: faker.name },
          expected: {
            message:
              'Category Not Found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          id: 'fake id',
          send_data: { name: faker.name },
          expected: {
            statusCode: 422,
            message: 'Validation failed (uuid is expected)',
            error: 'Unprocessable Entity',
          },
        },
      ];

      test.each(arrange)('when id is $id', async ({ id, send_data, expected }) => {
        return request(nestApp.app.getHttpServer())
          .patch(`/categories/${id}`)
          .send(send_data)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    describe('should a reponse error with 4222 when a request body is invalid', () => {
      const nestApp = startApp();
      const invalidRequest = UpdateCategoryFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key]
      }));

      test.each(arrange)('when body is $label', async ({ value }) => {
        return request(nestApp.app.getHttpServer())
          .patch(`/categories/${uuid}`)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected)
      });
    });

    describe('should a response error with 422 when throw EntityValidationError', () => {
      const nestApp = startApp();
      const validationError = UpdateCategoryFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(validationError).map((key) => ({
        label: key,
        value: validationError[key]
      }));

      let repo: ICategoryRepository;

      beforeEach(() => {
        repo = nestApp.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide
        );
      });

      test.each(arrange)('when body is $label', async ({ value }) => {
        const category = Category.fake()
          .aCategory().build();
        await repo.insert(category);
        return request(nestApp.app.getHttpServer())
          .patch(`/categories/${category.category_id.id}`)
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('shoud  update a category', () => {
      const nestApp = startApp();
      const arrange = UpdateCategoryFixture.arrangeForUpdate();
      let repo: ICategoryRepository;

      beforeEach(() => {
        repo = nestApp.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide
        );
      });

      test.each(arrange)('when body is $send_data', async ({ send_data, expected }) => {
        const category = Category.fake()
          .aCategory().build();
        await repo.insert(category);
        const res = await request(nestApp.app.getHttpServer())
          .patch(`/categories/${category.category_id.id}`)
          .send(send_data)
          .expect(200);

        const keyInResponse = UpdateCategoryFixture.keysInResponse;
        expect(Object.keys(res.body)).toStrictEqual(['data']);
        expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);

        const id = res.body.data.id;
        const categoryUpdated = await repo.findById(new Uuid(id));

        const presenter = CategoriesController.serialize(
          CategoryOutputMapper.toOutput(categoryUpdated!)
        );

        const serialized = instanceToPlain(presenter);
        expect(res.body.data).toStrictEqual(serialized);
        expect(res.body.data).toStrictEqual({
          id: serialized.id,
          created_at: serialized.created_at,
          name: expected.name ?? categoryUpdated?.name,
          description: expected.description ?? categoryUpdated?.description,
          is_active: expected.is_active ?? categoryUpdated?.is_active,
        })
      });
    });


  });
})