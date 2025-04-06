import { MediaFileValidator } from "@core/shared/domain/validators/media-file.validator";
import { Either } from "../../shared/domain/either";
import { ImageMedia, IMediaFile } from "../../shared/domain/value-objects/image-media.vo";

export interface IThumbnailCreateFromFile extends IMediaFile { }

export class Thumbnail extends ImageMedia {
  static readonly max_size = 2 * 1024 * 1024; // 2MB
  static readonly mimes_types = [
    "image/jpeg",
    "image/png",
  ];

  static createFromFile(props: IThumbnailCreateFromFile): Either<Thumbnail> {
    return Either.safe(() => {
      const { name } = MediaFileValidator
        .create(Thumbnail.max_size, Thumbnail.mimes_types)
        .validate(props);
      return new Thumbnail(
        `${props.video_id.id}-${name}`,
        `videos/${props.video_id.id}/thumbnails`
      );
    });
  }
}