import { IUseCase } from "../../../../shared/application/use-case.interface";
import { CreateGenreInput } from "./create-genre.input";
import { GenreOutput, GenreOutputMapper } from "../common/genre-output";
import { IUnitOfWork } from "../../../../shared/domain/repository/unit-of-work.interface";
import { IGenreRepository } from "../../../../genre/domain/genre.repository";
import { CategoriesIdExistsInDatabaseValidator } from "../../../../category/application/validations/categories-ids-exists-in-database.validators";
import { Genre } from "../../../../genre/domain/genre.aggregate";
import { EntityValidationError } from "../../../../shared/domain/validators/validation.error";
import { ICategoryRepository } from "../../../../category/domain/category.repository";

export type CreateGenreOutput = GenreOutput;

export class CreateGenreUseCase
  implements IUseCase<CreateGenreInput, CreateGenreOutput> {

  constructor(
    private uow: IUnitOfWork,
    private genreRepo: IGenreRepository,
    private categoryRepo: ICategoryRepository,
    private categoriesIdExistsInStorage: CategoriesIdExistsInDatabaseValidator
  ) { }

  async execute(input: CreateGenreInput): Promise<CreateGenreOutput> {
    const [categoriesId, errorsCategoriesIds] = (
      await this.categoriesIdExistsInStorage.validate(input.categories_id)
    ).asArray();

    const { name, is_active } = input;

    const entity = Genre.create({
      name,
      categories_id: errorsCategoriesIds ? [] : categoriesId,
      is_active,
    });

    const notifications = entity.notification;

    if (errorsCategoriesIds)
      notifications.setError(
        errorsCategoriesIds.map((e) => e.message),
        'categories_id',
      );

    if (notifications.hasErrors())
      throw new EntityValidationError(notifications.toJSON());

    await this.uow.do(async () => this.genreRepo.insert(entity));

    const categories = await this.categoryRepo.findByIds(
      Array.from(entity.categories_id.values()),
    );

    return GenreOutputMapper.toOutput(entity, categories);
  }
}