import { CreateGenreUseCase } from "../create-genre.use-case";
import { CategoriesIdStorageValidator } from "../../../../../category/application/validators/categories-ids-exists-in-storage.validators";
import { Category } from "../../../../../category/domain/category.aggregate";
import { setupSequelize } from "../../../../../shared/infra/helpers/helpers";
import { GenreCategoryModel, GenreModel } from "../../../../../genre/infra/db/sequelize/genre-model";
import { CategoryModel } from "../../../../../category/infra/db/sequelize/category.model";
import { Genre, GenreId } from "../../../../../genre/domain/genre.aggregate";
import { DatabaseError } from "sequelize";
import { UnitOfWorkSequelize } from "../../../../../shared/infra/db/sequelize/unit-of-work-sequelize";
import { GenreSequelizeRepository } from "../../../../../genre/infra/db/sequelize/genre-sequelize.repository";
import { CategorySequelizeRepository } from "../../../../../category/infra/db/sequelize/category-sequelize.repository";

describe('CreateGenreUseCase Integration Tests', () => {
  let uow: UnitOfWorkSequelize;
  let useCase: CreateGenreUseCase;
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;
  let categoriesIdsExistsInStorageValidator: CategoriesIdStorageValidator;

  const sequelizeHelper = setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
  });

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    categoriesIdsExistsInStorageValidator = new CategoriesIdStorageValidator(categoryRepo);
    useCase = new CreateGenreUseCase(
      uow,
      genreRepo,
      categoryRepo,
      categoriesIdsExistsInStorageValidator,
    );
  });

  it('should create a genre', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepo.bulkInsert(categories);
    const categoriesId = categories.map((c) => c.category_id.id);
    let output = await useCase.execute({
      name: 'test genre',
      categories_id: categoriesId,
    });
    let entity = await genreRepo.findById(new GenreId(output.id));
    expect(output).toStrictEqual({
      id: entity!.genre_id.id,
      name: 'test genre',
      categories: expect.arrayContaining(
        categories.map((e) => ({
          id: e.category_id.id,
          name: e.name,
          created_at: e.created_at,
        }))
      ),
      categories_id: expect.arrayContaining(categoriesId),
      is_active: true,
      created_at: entity!.created_at,
    });
  });

  it('rollback transaction', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepo.bulkInsert(categories);
    const categoriesId = categories.map((c) => c.category_id.id);

    const genre = Genre.fake().aGenre().build();
    genre.name = 't'.repeat(256);

    const mockCreate = jest.spyOn(Genre, 'create')
      .mockImplementation(() => genre);

    await expect(
      useCase.execute({
        name: 'test genre',
        categories_id: categoriesId,
      }),
    ).rejects.toThrow(DatabaseError);

    const genres = await genreRepo.findAll();
    expect(genres.length).toEqual(0);
    mockCreate.mockRestore();
  });

});