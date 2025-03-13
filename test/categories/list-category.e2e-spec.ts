import { CategorySearchParams, ICategoryRepository } from "@core/category/domain/category.repository";
import request from "supertest";
import { CATEGORY_PROVIDERS } from "src/nest-modules/categories-modules/categories.provider";
import { ListCategoriesFixture } from "src/nest-modules/categories-modules/testing/category-fixture";
import { startApp } from "src/nest-modules/shared-module/testing/helper";
import { instanceToPlain } from "class-transformer";
import { CategoriesController } from "src/nest-modules/categories-modules/categories.controller";
import { CategoryOutputMapper } from "@core/category/application/use-cases/common/category-output";

describe('CategoriesController (e2e)', () => {

  describe('/categories (GET)', () => {

    describe('should return categories sorted by created_at when request qury is empty', () => {
      let repo: ICategoryRepository;
      const nestApp = startApp();
      const { entitiesMap, arrange } = ListCategoriesFixture
        .arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        repo = nestApp.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide
        );
        await repo.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)('when query params is $send_data', async ({ send_data, expected }) => {
        const queryParams = new URLSearchParams(send_data as any).toString();
        return request(nestApp.app.getHttpServer())
          .get(`/categories/?${queryParams}`)
          .expect(200)
          .expect({
            data: expected.entities.map((e) => instanceToPlain(
              CategoriesController.serialize(CategoryOutputMapper.toOutput(e))
            )),
            meta: expected.meta
          });

      });
    });

    describe('should return categories using paginate, filter and sort', () => {
      const nestApp = startApp();
      const { entitiesMap, arrange } = ListCategoriesFixture.arrangeUnsorted();
      let repo: ICategoryRepository;

      beforeEach(async () => {
        repo = nestApp.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
        await repo.bulkInsert(Object.values(entitiesMap));
      });

      test.each([arrange])(
        'when query params is $send_data',
        async ({ send_data, expected }) => {
          const queryParams = new URLSearchParams(send_data as any).toString();
          return request(nestApp.app.getHttpServer())
            .get(`/categories/?${queryParams}`)
            .expect(200)
            .expect({
              data: expected.entities.map((e) => instanceToPlain(
                CategoriesController.serialize(CategoryOutputMapper.toOutput(e))
              )),
              meta: expected.meta
            });
        });

    });
  });

});