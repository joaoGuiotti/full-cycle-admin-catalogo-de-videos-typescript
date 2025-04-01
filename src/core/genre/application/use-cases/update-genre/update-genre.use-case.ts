import { IUseCase } from "../../../../shared/application/use-case.interface";
import { UpdateGenreInput } from "./update-genre.input";
import { GenreOutput, GenreOutputMapper } from "../common/genre-output";
import { IUnitOfWork } from "../../../../shared/domain/repository/unit-of-work.interface";
import { IGenreRepository } from "../../../../genre/domain/genre.repository";
import { ICategoryRepository } from "../../../../category/domain/category.repository";
import { CategoriesIdStorageValidator } from "../../../../category/application/validators/categories-ids-exists-in-storage.validators";
import { Genre, GenreId } from "../../../../genre/domain/genre.aggregate";
import { NotFoundError } from "../../../../shared/domain/errors/not-found.error";
import { EntityValidationError } from "@core/shared/domain/validators/validation.error";

export type UpdateGenreOutput = GenreOutput;

export class UpdateGenreUseCase
  implements IUseCase<UpdateGenreInput, UpdateGenreOutput> {
  constructor(
    private uow: IUnitOfWork,
    private genreRepo: IGenreRepository,
    private categoryRepo: ICategoryRepository,
    private categoriesIdStorageValidator: CategoriesIdStorageValidator,
  ) { }

  async execute(input: UpdateGenreInput): Promise<UpdateGenreOutput> {
    const genreId = new GenreId(input.id);
    const genre = await this.genreRepo.findById(genreId);

    if (!genre) {
      throw new NotFoundError(input.id, Genre);
    }

    input.name && genre.changeName(input.name);

    if (input.is_active === true) {
      genre.activate();
    }

    if (input.is_active === false) {
      genre.deactivate();
    }

    const notification = genre.notification;

    if (input.categories_id) {
      const [categoriesId, errorsCategoriesId] = (
        await this.categoriesIdStorageValidator.validate(
          input.categories_id,
        )
      ).asArray();

      categoriesId && genre.syncCategoriesId(categoriesId);

      errorsCategoriesId &&
        notification.setError(
          errorsCategoriesId.map((e) => e.message),
          'categories_id',
        );
    }

    if (genre.notification.hasErrors()) {
      throw new EntityValidationError(genre.notification.toJSON());
    }

    await this.uow.do(async () => {
      return this.genreRepo.update(genre);
    });

    const categories = await this.categoryRepo.findByIds(
      Array.from(genre.categories_id.values()),
    );

    return GenreOutputMapper.toOutput(genre, categories);
  }
}