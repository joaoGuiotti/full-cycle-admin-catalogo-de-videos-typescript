import { Video, VideoId } from "../../../video/domain/video.aggregate";
import { IUseCase } from "../../../shared/application/use-case.interface";
import { UploadImageMediasInput } from "./upload-image-medias.input";
import { IVideoRepository } from "../../../video/domain/video.repository";
import { NotFoundError } from "../../../shared/domain/errors/not-found.error";
import { Banner } from "../../../video/domain/banner.vo";
import { Thumbnail } from "../../../video/domain/thumbnail.vo";
import { ThumbnailHalf } from "../../../video/domain/thumbnail-half.vo";
import { EntityValidationError } from "../../../shared/domain/validators/validation.error";
import { IUnitOfWork } from "../../../shared/domain/repository/unit-of-work.interface";
import { IStorage } from "../../../shared/application/storage.interafce";

export type UploadImageMediasOutput = void;

export class UploadImageMediasUseCase
  implements IUseCase<UploadImageMediasInput, UploadImageMediasOutput> {

  constructor(
    private readonly uow: IUnitOfWork,
    private readonly videoRepo: IVideoRepository,
    private readonly storage: IStorage, 
  ) { }

  async execute(input: UploadImageMediasInput): Promise<UploadImageMediasOutput> {
    const videoId = new VideoId(input.video_id);
    const video = await this.videoRepo.findById(videoId);

    if (!video)
      throw new NotFoundError(input.video_id, Video);

    const imagesMap = {
      banner: Banner,
      thumbnail: Thumbnail,
      thumbnail_half: ThumbnailHalf,
    }

    const [image, errorImage] = imagesMap[input.field].createFromFile({
      ...input.file,
      video_id: videoId
    }).asArray();

    if (errorImage)
      throw new EntityValidationError([
        { [input.field]: [errorImage.message] }
      ]);

    image instanceof Banner && video.replaceBanner(image);
    image instanceof Thumbnail && video.replaceThumbnail(image);
    image instanceof ThumbnailHalf && video.replaceThumbnailHalf(image);

    await this.storage.store({
      data: input.file.data,
      mime_type: input.file.mime_type,
      id: image.url,
    });

    await this.uow.do(async () => {
      await this.videoRepo.update(video)
    });
  }
}

