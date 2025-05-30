import { Either } from "../../shared/domain/either";
import { MediaFileValidator } from "../../shared/domain/validators/media-file.validator";
import { ImageMedia, IMediaFile } from "../../shared/domain/value-objects/image-media.vo";

export interface IThumbnailHalfCreateFromFile extends IMediaFile { }

export class ThumbnailHalf extends ImageMedia {
  static readonly max_size = 2 * 1024 * 1024; // 2MB
  static readonly mimes_types = [
    "image/jpeg",
    "image/png",
  ];

  static createFromFile(props: IThumbnailHalfCreateFromFile): Either<ThumbnailHalf> {
    return Either.safe(() => {
      const { name } = MediaFileValidator
        .create(ThumbnailHalf.max_size, ThumbnailHalf.mimes_types)
        .validate(props);

      return new ThumbnailHalf(
        `${props.video_id.id}-${name}`,
        `videos/${props.video_id.id}/thumbnailsHalfs`
      );
    });
  }
}