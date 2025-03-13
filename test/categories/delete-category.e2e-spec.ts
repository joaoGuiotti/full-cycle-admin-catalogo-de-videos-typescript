import { Category } from "@core/category/domain/category.entity";
import { ICategoryRepository } from "@core/category/domain/category.repository";
import { CATEGORY_PROVIDERS } from "src/nest-modules/categories-modules/categories.provider";
import { startApp } from "src/nest-modules/shared-module/testing/helper";
import request from 'supertest';

describe('CategoriesController (e2e)', () => {

  describe('/delete/:id (DELETE)', () => {
    const appHelper = startApp();

    describe('should a response error when is invalid or not found', () => {
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
        return request(appHelper.app.getHttpServer())
          .delete(`/categories/${id}`)
          .expect(expected.statusCode)
          .expect(expected);
      });

    });

    it('should delete a category response with status 204', async () => {
      const repo = appHelper.app.get<ICategoryRepository>(
        CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide
      );

      const category = Category.fake().aCategory().build();
      await repo.insert(category);

      await request(appHelper.app.getHttpServer())
        .delete(`/categories/${category.category_id.id}`)
        .expect(204);

      await expect(repo.findById(category.category_id))
        .resolves.toBeNull();
    });
  });

});
