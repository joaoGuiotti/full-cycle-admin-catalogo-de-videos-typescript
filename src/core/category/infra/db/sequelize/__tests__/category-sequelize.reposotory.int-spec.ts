import { Sequelize } from "sequelize-typescript";
import { CategoryModel } from "../category.model";
import { CategorySequelizeRepository } from "../category-sequelize.repository";
import { Category } from "../../../../domain/category.aggregate";
import { Uuid } from "../../../../../shared/domain/value-objects/uuid.vo";
import { NotFoundError } from "../../../../../shared/domain/errors/not-found.error";
import { CategoryModelMapper } from "../category-model-mapper";
import { CategorySearchParams, CategorySearchResult } from "../../../../domain/category.repository";
import { setupSequelize } from "../../../../../shared/infra/helpers/helpers";

describe('CategorySequelizeRepository Integration it', () => {
  let repository!: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(async () => {
    repository = new CategorySequelizeRepository(CategoryModel);
  });

  it('Should insert a new category', async () => {
    let category = Category.fake().aCategory().withName('movie').build();
    await repository.insert(category);
    let entity = await repository.findById(category.category_id);
    expect(entity?.toJSON()).toStrictEqual(category.toJSON());

    category = Category.fake().aCategory()
      .withName('Movie')
      .withDescription('Some Description')
      .build();

    await repository.insert(category);
    entity = await repository.findById(category.category_id);
    expect(entity?.toJSON()).toStrictEqual(category.toJSON());
  });

  it('Should finds a entoty by id', async () => {
    let entityFound = await repository.findById(new Uuid());
    expect(entityFound).toBeNull();

    const category = Category.fake().aCategory().withName('Movie').build();
    await repository.insert(category);
    entityFound = await repository.findById(category.category_id);
    expect(category.toJSON()).toStrictEqual(entityFound?.toJSON());
  });

  it('Should return all categories', async () => {
    let category = Category.fake().aCategory().withName('Movie').build();
    await repository.insert(category);
    const entities = await repository.findAll();
    expect(entities).toHaveLength(1);
    expect(entities[0].toJSON()).toStrictEqual(category.toJSON());
    expect(JSON.stringify(entities)).toBe(JSON.stringify([category]));
  });

  it('Should throw error on update when a entity not found', async () => {
    const category = Category.fake().aCategory().build();
    await expect(repository.update(category)).rejects.toThrow(
      new NotFoundError(category.category_id.id, Category)
    );
  });

  it('Should update a entity', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);

    category.changeName('Movie Update');
    await repository.update(category);

    const entityFound = await repository.findById(category.category_id);
    expect(category.toJSON()).toStrictEqual(entityFound?.toJSON());
  });

  it('Should throw error on delete when a entity not found', async () => {
    const category = Category.fake().aCategory().build();
    await expect(repository.delete(category.category_id)).rejects.toThrow(
      new NotFoundError(category.category_id.id, Category)
    );
  });

  it('Should throw error on delete when a entity not found', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);

    await repository.delete(category.category_id);
    const entity = await repository.findById(category.category_id)
    expect(entity).toBeNull();
  });

  describe('Search method tests', () => {

    it('Should only apply paginate when other params are null', async () => {
      const created_at = new Date();
      const categories = Category.fake()
        .theCategories(16)
        .withName('Movie')
        .withDescription(null)
        .withCreatedAt(created_at)
        .build();
      await repository.bulkInsert(categories);
      const spyToEntity = jest.spyOn(CategoryModelMapper, 'toEntity');

      const searchOutput = await repository.search(new CategorySearchParams());
      expect(searchOutput).toBeInstanceOf(CategorySearchResult);
      expect(spyToEntity).toHaveBeenCalledTimes(15);
      expect(searchOutput.toJSON()).toMatchObject({
        total: 16,
        current_page: 1,
        last_page: 2,
        per_page: 15
      });
      searchOutput.items.forEach((item) => {
        expect(item).toBeInstanceOf(Category);
        expect(item.category_id).toBeDefined();
      });

      const items = searchOutput.items.map((item) => item.toJSON());
      expect(items).toMatchObject(
        new Array(15).fill({
          name: 'Movie',
          description: null,
          is_active: true,
          created_at
        })
      );

    });

    it('Should order by created_at DESC when search params are null', async () => {
      const created_at = new Date();
      const categories = Category.fake()
        .theCategories(16)
        .withName((index) => `Movie ${index}`)
        .withDescription(null)
        .withCreatedAt((index) => new Date(created_at.getTime() + index))
        .build();
      await repository.bulkInsert(categories);

      const searchOutput = await repository.search(new CategorySearchParams());
      const items = searchOutput.items;
      [...items].reverse().forEach((item, index) => {
        expect(`${item.name}`).toBe(`${categories[index + 1].name}`);
      })
    });

    it('Should apply paginate and filter', async () => {
      const categories = [
        Category.fake().aCategory()
          .withName('test')
          .withCreatedAt(new Date(new Date().getTime() + 5000))
          .build(),
        Category.fake().aCategory()
          .withName('a')
          .withCreatedAt(new Date(new Date().getTime() + 4000))
          .build(),
        Category.fake().aCategory()
          .withName('TEST')
          .withCreatedAt(new Date(new Date().getTime() + 3000))
          .build(),
        Category.fake().aCategory()
          .withName('TeSt')
          .withCreatedAt(new Date(new Date().getTime() + 1000))
          .build(),
      ];
      await repository.bulkInsert(categories);
      let searchOutput = await repository.search(
        new CategorySearchParams({
          page: 1,
          per_page: 2,
          filter: 'TEST'
        })
      );

      expect(searchOutput.toJSON(true)).toMatchObject(
        new CategorySearchResult({
          items: [categories[0], categories[2]],
          total: 3,
          current_page: 1,
          per_page: 2
        }).toJSON(true)
      );

      searchOutput = await repository.search(
        new CategorySearchParams({
          page: 2,
          per_page: 2,
          filter: 'TEST'
        })
      );

      expect(searchOutput.toJSON(true)).toMatchObject(
        new CategorySearchResult({
          items: [categories[3]],
          total: 3,
          current_page: 2,
          per_page: 2
        }).toJSON(true)
      );
    });

    it('Should apply paginate and sort', async () => {
      expect(repository.sortableFields).toStrictEqual(['name', 'created_at']);

      const categories = [
        Category.fake().aCategory().withName('b').build(),
        Category.fake().aCategory().withName('a').build(),
        Category.fake().aCategory().withName('d').build(),
        Category.fake().aCategory().withName('e').build(),
        Category.fake().aCategory().withName('c').build(),
      ];

      await repository.bulkInsert(categories);

      const arrange = [
        {
          params: new CategorySearchParams({
            page: 1,
            per_page: 2,
            sort: 'name'
          }),
          result: new CategorySearchResult({
            items: [categories[1], categories[0]],
            total: 5,
            current_page: 1,
            per_page: 2
          })
        },
        {
          params: new CategorySearchParams({
            page: 2,
            per_page: 2,
            sort: 'name'
          }),
          result: new CategorySearchResult({
            items: [categories[4], categories[2]],
            total: 5,
            current_page: 2,
            per_page: 2
          })
        },
        {
          params: new CategorySearchParams({
            page: 3,
            per_page: 2,
            sort: 'name'
          }),
          result: new CategorySearchResult({
            items: [categories[3]],
            total: 5,
            current_page: 3,
            per_page: 2
          })
        }
      ];

      for (const i of arrange) {
        const result = await repository.search(i.params);
        expect(result.toJSON(true)).toMatchObject(i.result.toJSON(true));
      }
    });

    describe('should search using filter, sort and paginate', () => {
      const categories = [
        Category.fake().aCategory().withName('test').build(),
        Category.fake().aCategory().withName('a').build(),
        Category.fake().aCategory().withName('TEST').build(),
        Category.fake().aCategory().withName('e').build(),
        Category.fake().aCategory().withName('TeSt').build(),
      ];

      const arrange = [
        {
          search_params: new CategorySearchParams({
            page: 1,
            per_page: 2,
            sort: 'name',
            filter: 'TEST',
          }),
          search_result: new CategorySearchResult({
            items: [categories[2], categories[4]],
            total: 3,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          search_params: new CategorySearchParams({
            page: 2,
            per_page: 2,
            sort: 'name',
            filter: 'TEST',
          }),
          search_result: new CategorySearchResult({
            items: [categories[0]],
            total: 3,
            current_page: 2,
            per_page: 2,
          }),
        },
      ];

      beforeEach(async () => {
        await repository.bulkInsert(categories);
      });

      test.each(arrange)(
        'when value is $search_params',
        async ({ search_params, search_result }) => {
          const result = await repository.search(search_params);
          expect(result.toJSON(true)).toMatchObject(search_result.toJSON(true));
        },
      );
    });

  });
});