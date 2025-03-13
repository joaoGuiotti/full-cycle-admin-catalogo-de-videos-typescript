import { ICategoryRepository } from "@core/category/domain/category.repository";
import { CategoriesController } from "../categories.controller"
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "src/nest-modules/config-modules/config.module";
import { DatabaseModule } from "src/nest-modules/database-modules/database.module";
import { CategoriesModule } from "../categories.module";
import { CATEGORY_PROVIDERS } from "../categories.provider";
import { CreateCategoryUseCase, DeleteCategoryUseCase, GetCategoryUseCase, ListCategoriesUseCase, UpdateCategoryUseCase } from "@core/category/application/use-cases";
import { CategoryCollectionPresenter, CategoryPresenter } from "../category.presenter";
import { CreateCategoryFixture, ListCategoriesFixture, UpdateCategoryFixture } from "../testing/category-fixture";
import { CategoryOutputMapper } from "@core/category/application/use-cases/common/category-output";
import { Category, CategoryId } from "@core/category/domain/category.aggregate";

describe('CategoriesController Integration Tests', () => {
  let controller: CategoriesController;
  let repo: ICategoryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        DatabaseModule,
        CategoriesModule
      ]
    }).compile();
    controller = module.get<CategoriesController>(CategoriesController);
    repo = module.get<ICategoryRepository>(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller['createUseCase']).toBeInstanceOf(CreateCategoryUseCase);
    expect(controller['updateUseCase']).toBeInstanceOf(UpdateCategoryUseCase);
    expect(controller['deleteUseCase']).toBeInstanceOf(DeleteCategoryUseCase);
    expect(controller['getUseCase']).toBeInstanceOf(GetCategoryUseCase);
    expect(controller['listUseCase']).toBeInstanceOf(ListCategoriesUseCase);
  });

  describe('should create a category', () => {
    const arrange = CreateCategoryFixture.arrangeForCreate();
    test.each(arrange)('when body is $send_data', async ({ send_data, expected }) => {
      const presenter = await controller.create(send_data);
      const entity = await repo.findById(new CategoryId(presenter.id));
      expect(entity?.toJSON()).toStrictEqual({
        category_id: presenter.id,
        created_at: presenter.created_at,
        ...expected,
      })
      const output = CategoryOutputMapper.toOutput(entity!);
      expect(presenter).toEqual(new CategoryPresenter(output));
    });
  });

  describe('should update a category', () => {
    const arrange = UpdateCategoryFixture.arrangeForUpdate();

    const category = Category.fake().aCategory().build();

    beforeEach(async () => {
      await repo.insert(category);
    });

    test.each(arrange)(
      'when body is $send_data',
      async ({ send_data, expected }) => {
        const presenter = await controller.update(
          category.category_id.id,
          send_data
        );

        const entity = await repo.findById(new CategoryId(presenter.id));
        expect(entity?.toJSON()).toStrictEqual({
          category_id: presenter.id,
          created_at: presenter.created_at,
          name: expected.name ?? category.name,
          description:
            'description' in expected
              ? expected.description
              : category.description,
          is_active:
            expected.is_active === true || expected.is_active === false
              ? expected.is_active
              : category.is_active,
        });
        const output = CategoryOutputMapper.toOutput(entity as any);
        expect(presenter).toEqual(new CategoryPresenter(output));
      });
  });

  it('should delete a category', async () => {
    const category = Category.fake().aCategory().build();
    await repo.insert(category);
    const response = await controller.remove(category.category_id.id);
    expect(response).not.toBeDefined();
    await expect(repo.findById(category.category_id)).resolves.toBeNull();
  });

  it('should get a category', async () => {
    const category = Category.fake().aCategory().build();
    await repo.insert(category);
    const presenter = await controller.findOne(category.category_id.id);

    const output = CategoryOutputMapper.toOutput(category);
    expect(presenter).toEqual(new CategoryPresenter(output));
  });

  describe('search method', () => {

    describe('should sorted categories by created_at', () => {
      const { entitiesMap, arrange } = ListCategoriesFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        await repo.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when send_data is $send_data',
        async ({ send_data, expected }) => {
          const presenter = await controller.search(send_data);
          const { entities, ...paginationProps } = expected;
          expect(presenter).toEqual(
            new CategoryCollectionPresenter({
              items: entities.map(CategoryOutputMapper.toOutput),
              ...paginationProps.meta
            })
          )
        })
    })

    describe('should return categories using pagination, sort and filter', () => {
      const { entitiesMap, arrange } = ListCategoriesFixture.arrangeUnsorted();

      beforeEach(async () => {
        await repo.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when send_data is $send_data',
        async ({ send_data, expected }) => {
          const presenter = await controller.search(send_data);
          const { entities, ...paginationProps } = expected;
          expect(presenter).toEqual(
            new CategoryCollectionPresenter({
              items: entities.map(CategoryOutputMapper.toOutput),
              ...paginationProps.meta
            })
          )
        })
    })

  });

});