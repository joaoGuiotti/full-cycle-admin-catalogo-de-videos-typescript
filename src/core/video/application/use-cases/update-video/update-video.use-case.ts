import { IUseCase } from "../../../../shared/application/use-case.interface";
import { IUnitOfWork } from "../../../../shared/domain/repository/unit-of-work.interface";
import { UpdateVideoInput } from "./update-video.input";
import { IVideoRepository } from "../../../../video/domain/video.repository";
import { CategoriesIdStorageValidator } from "../../../../category/application/validators/categories-ids-exists-in-storage.validators";
import { GenresIdStorageValidator } from "../../../../genre/application/validations/genres-id-storage-validator";
import { CastMembersIdStorageValidator } from "../../../../cast-member/application/validators/cast-members-id-storage-validator";
import { Video, VideoId } from "../../../../video/domain/video.aggregate";
import { NotFoundError } from "../../../../shared/domain/errors/not-found.error";
import { Rating } from "../../../../video/domain/rating.vo";
import { EntityValidationError } from "../../../../shared/domain/validators/validation.error";

export class UpdateVideoUseCase
  implements IUseCase<UpdateVideoInput, UpdateVideoOutput> {
  constructor(
    private uow: IUnitOfWork,
    private videoRepo: IVideoRepository,
    private categoriesIdValidator: CategoriesIdStorageValidator,
    private genresIdValidator: GenresIdStorageValidator,
    private castMembersIdValidator: CastMembersIdStorageValidator,
  ) { }

  async execute(input: UpdateVideoInput): Promise<UpdateVideoOutput> {
    const videoId = new VideoId(input.id);
    const video = await this.videoRepo.findById(videoId);

    if (!video)
      throw new NotFoundError(input.id, Video);

    input.title && video.changeTitle(input.title);
    input.description && video.changeDescription(input.description);
    input.year_launched && video.changeYearLaunched(input.year_launched);
    input.duration && video.changeDuration(input.duration);
    if (input.rating) {
      const [type, errorRating] = Rating.create(input.rating).asArray();

      video.changeRating(type);

      errorRating && video.notification.setError(errorRating.message, 'type');
    }

    if (input.is_opened === true)
      video.markAsOpened();

    if (input.is_opened === false)
      video.markAsClosed();

    const notification = video.notification;

    if (input.categories_id) {
      const [categoriesId, errorsCategoriesId] = (
        await this.categoriesIdValidator.validate(input.categories_id)
      ).asArray();

      categoriesId && video.syncCategoriesId(categoriesId);

      errorsCategoriesId &&
        notification.setError(
          errorsCategoriesId.map((e) => e.message),
          'categories_id',
        );
    }

    if (input.genres_id) {
      const [genresId, errorsGenresId] = (
        await this.genresIdValidator.validate(input.genres_id)
      ).asArray();

      genresId && video.syncGenresId(genresId);

      errorsGenresId &&
        notification.setError(
          errorsGenresId.map((e) => e.message),
          'genres_id',
        );
    }

    if (input.cast_members_id) {
      const [castMembersId, errorsCastMembersId] = (
        await this.castMembersIdValidator.validate(input.cast_members_id)
      ).asArray();

      castMembersId && video.syncCastMembersId(castMembersId);

      errorsCastMembersId &&
        notification.setError(
          errorsCastMembersId.map((e) => e.message),
          'cast_members_id',
        );
    }

    if (video.notification.hasErrors())
      throw new EntityValidationError(video.notification.toJSON());

    await this.uow.do(async () => this.videoRepo.update(video));

    return { id: video.video_id.id };
  }
}

export type UpdateVideoOutput = { id: string };