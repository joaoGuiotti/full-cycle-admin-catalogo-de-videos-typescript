import { CategoriesIdStorageValidator } from "../../core/category/application/validators/categories-ids-exists-in-storage.validators"
import { ICategoryRepository } from "../../core/category/domain/category.repository"
import { CreateGenreUseCase } from "../../core/genre/application/use-cases/create-genre/create-genre.use-case"
import { IGenreRepository } from "../../core/genre/domain/genre.repository"
import { GenreInMemoryRepository } from "../../core/genre/infra/db/in-memory/genre-in-memory.repository"
import { GenreModel } from "../../core/genre/infra/db/sequelize/genre-model"
import { GenreSequelizeRepository } from "../../core/genre/infra/db/sequelize/genre-sequelize.repository"
import { IUnitOfWork } from "../../core/shared/domain/repository/unit-of-work.interface"
import { UnitOfWorkSequelize } from "../../core/shared/infra/db/sequelize/unit-of-work-sequelize"
import { getModelToken } from "@nestjs/sequelize"
import { CATEGORY_PROVIDERS } from "../categories-modules/categories.provider"
import { DeleteGenreUseCase, GetGenreUseCase, ListGenresUseCase, UpdateGenreUseCase } from "../../core/genre/application"
import { GenresIdStorageValidator } from "../../core/genre/application/validations/genres-id-storage-validator"

export const UOW_TOKEN = 'UnitOfWork';

export const REPOSITORIES = {
  GENRE_REPOSITORY: {
    provide: 'GenreRepository',
    useExisting: GenreSequelizeRepository,
  },
  GENRE_IN_MEMORY_REPOSITORY: {
    provide: GenreInMemoryRepository,
    useClass: GenreInMemoryRepository,
  },
  GENRE_SEQUELIZE_REPOSITORY: {
    provide: GenreSequelizeRepository,
    useFactory: (genreModel: typeof GenreModel, uow: UnitOfWorkSequelize) =>
      new GenreSequelizeRepository(genreModel, uow),
    inject: [getModelToken(GenreModel), UOW_TOKEN]
  }
};

export const USE_CASES = {
  CREATE_GENRE_USE_CASE: {
    provide: CreateGenreUseCase,
    useFactory: (
      uow: IUnitOfWork,
      genreRepo: IGenreRepository,
      categoryRepo: ICategoryRepository,
      categoriesValidator: CategoriesIdStorageValidator
    ) => new CreateGenreUseCase(uow, genreRepo, categoryRepo, categoriesValidator),
    inject: [
      UOW_TOKEN,
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_ID_STORAGE_VALIDATOR.provide,
    ],
  },
  UPDATE_GENRE_USE_CASE: {
    provide: UpdateGenreUseCase,
    useFactory: (
      uow: IUnitOfWork,
      genreRepo: IGenreRepository,
      categoryRepo: ICategoryRepository,
      categoriesValidator: CategoriesIdStorageValidator
    ) => new UpdateGenreUseCase(uow, genreRepo, categoryRepo, categoriesValidator),
    inject: [
      UOW_TOKEN,
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_ID_STORAGE_VALIDATOR.provide,
    ],
  },
  LIST_GENRE_USE_CASE: {
    provide: ListGenresUseCase,
    useFactory: (
      genreRepo: IGenreRepository,
      categoryRepo: ICategoryRepository
    ) => new ListGenresUseCase(genreRepo, categoryRepo),
    inject: [
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    ],
  },
  GET_GENRE_USE_CASE: {
    provide: GetGenreUseCase,
    useFactory: (
      genreRepo: IGenreRepository,
      categoryRepo: ICategoryRepository
    ) => new GetGenreUseCase(genreRepo, categoryRepo),
    inject: [
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    ],
  },
  DELETE_GENRE_USE_CASE: {
    provide: DeleteGenreUseCase,
    useFactory: (uow: IUnitOfWork, genreRepo: IGenreRepository) => {
      return new DeleteGenreUseCase(uow, genreRepo);
    },
    inject: [UOW_TOKEN, REPOSITORIES.GENRE_REPOSITORY.provide],
  },
};

export const VALIDATIONS = {
  GENRES_IDS_EXISTS_IN_DATABASE_VALIDATOR: {
    provide: GenresIdStorageValidator,
    useFactory: (genreRepo: IGenreRepository) => {
      return new GenresIdStorageValidator(genreRepo);
    },
    inject: [REPOSITORIES.GENRE_REPOSITORY.provide],
  },
};

export const GENRE_PROVIDERS = {
  REPOSITORIES,
  USE_CASES,
  VALIDATIONS
}