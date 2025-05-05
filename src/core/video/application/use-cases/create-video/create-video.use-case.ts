import { IUseCase } from "../../../../shared/application/use-case.interface";
import { CreateVideoInput } from "./create-video.input";
import { IUnitOfWork } from "../../../../shared/domain/repository/unit-of-work.interface";
import { IVideoRepository } from "../../../../video/domain/video.repository";
import { CategoriesIdStorageValidator } from "../../../../category/application/validators/categories-ids-exists-in-storage.validators";
import { GenresIdStorageValidator } from "../../../../genre/application/validations/genres-id-storage-validator";
import { CastMembersIdStorageValidator } from "../../../../cast-member/application/validators/cast-members-id-storage-validator";
import { Video } from "../../../../video/domain/video.aggregate";
import { Rating } from "../../../../video/domain/rating.vo";
import { EntityValidationError } from "../../../../shared/domain/validators/validation.error";

export type CreateVideoOutput = { id: string };

export class CreateVideoUseCase
  implements IUseCase<CreateVideoInput, CreateVideoOutput> {

  constructor(
    private uow: IUnitOfWork,
    private videoRepo: IVideoRepository,
    private categoriesIdValidator: CategoriesIdStorageValidator,
    private genresIdValidator: GenresIdStorageValidator,
    private castMembersIdValidator: CastMembersIdStorageValidator,
  ) { }

  async execute(input: CreateVideoInput): Promise<CreateVideoOutput> {
    const [rating, errorRating] = Rating.create(input.rating).asArray();

    const [eitherCategoriesId, eitherGenresId, eitherCastMembers] = await Promise.all([
      await this.categoriesIdValidator.validate(input.categories_id),
      await this.genresIdValidator.validate(input.genres_id),
      await this.castMembersIdValidator.validate(input.cast_members_id),
    ]);

    const [categoriesId, errorsCategoriesId] = eitherCategoriesId.asArray();
    const [genresId, errorsGenresId] = eitherGenresId.asArray();
    const [castMembersId, errorsCastMembersId] = eitherCastMembers.asArray();

    const video = Video.create({
      ...input,
      rating,
      categories_id: errorsCategoriesId ? [] : categoriesId,
      genres_id: errorsGenresId ? [] : genresId,
      cast_members_id: errorsCastMembersId ? [] : castMembersId,
    });

    const notification = video.notification;

    if (errorsCategoriesId)
      notification.setError(errorsCategoriesId.map((e) => e.message), 'categories_id');
    if (errorsGenresId)
      notification.setError(errorsGenresId.map((e) => e.message), 'genres_id');
    if (errorsCastMembersId)
      notification.setError(errorsCastMembersId.map((e) => e.message), 'cast_members_id');
    if (errorRating)
      notification.setError(errorRating.message, 'rating');

    if (notification.hasErrors())
      throw new EntityValidationError(notification.toJSON());

    await this.uow.do(async () => this.videoRepo.insert(video));

    return { id: video.video_id.id };
  }

}

//cqs (bertrand meyer) !== cqrs (greg young)

// CQRS is a pattern that separates the read and write sides of an application.
// CQS is a principle that states that a method should either be a command (which changes state) or a query (which returns data), but not both.