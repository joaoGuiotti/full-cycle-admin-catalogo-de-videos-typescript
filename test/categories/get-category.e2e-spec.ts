import request from "supertest";
import { startApp } from "src/nest-modules/shared-module/testing/helper";
import supertest from "supertest";
import { ICategoryRepository } from "@core/category/domain/category.repository";
import { REPOSITORIES } from "src/nest-modules/categories-modules/categories.provider";
import { Category } from "@core/category/domain/category.entity";
import { GetCategoryFixture } from "src/nest-modules/categories-modules/testing/category-fixture";


describe('CategoriesController (e2e)', () => {
  const nestApp = startApp();

  describe('/categories/:id (GET)', () => {

    describe('should a response error when id is invalid or not found', () => {
      const arrange = [
        {
          id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          expected: {
            message:
              'Category Not Found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          id: 'fake id',
          expected: {
            statusCode: 422,
            message: 'Validation failed (uuid is expected)',
            error: 'Unprocessable Entity',
          },
        },
      ];

      test.each(arrange)('when ID is $id', async ({ id, expected }) => {
        return request(nestApp.app.getHttpServer())
          .get(`/categories/${id}`)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });


    it('should return a category', async () => {
      const repo = nestApp.app.get<ICategoryRepository>(
        REPOSITORIES.CATEGORY_REPOSITORY.provide
      );

      const category = Category.fake()
        .aCategory().build();

      await repo.insert(category);

      const res = await request(nestApp.app.getHttpServer())
        .get(`/categories/${category.category_id.id}`)
        .expect(200);
      const keysInResponse = GetCategoryFixture.keysInResponse;
      expect(Object.keys(res.body)).toStrictEqual(['data']);
      expect(Object.keys(res.body.data)).toStrictEqual(keysInResponse);
    });

  });
});