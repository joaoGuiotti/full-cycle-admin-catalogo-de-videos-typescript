import { InvalidMediaFileMimeTypeError, InvalidMediaFileSizeError } from "../../shared/domain/validators/media-file.validator";
import { Either } from "../../shared/domain/either";
import { ImageMedia, IMediaFile } from "../../shared/domain/value-objects/image-media.vo";

export interface IBannerCreateFromFile extends IMediaFile { }

export class Banner extends ImageMedia {
  static readonly max_size = 2 * 1024 * 1024; // 2MB
  static readonly mimes_types = [
    "image/jpeg",
    "image/png",
    "image/gif",
  ];

  static createFromFile(props: IBannerCreateFromFile): Either<Banner, InvalidMediaFileMimeTypeError | InvalidMediaFileSizeError> {
    return Either.safe<Banner>(() => {
      const { name } = this.validate(
        props,
        Banner.max_size,
        Banner.mimes_types
      );
      return new Banner(name, `videos/${props.video_id.id}/imagens`);
    });
  }
}