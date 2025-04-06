import { Either } from "@core/shared/domain/either";
import { MediaFileValidator } from "@core/shared/domain/validators/media-file.validator";
import { AudioVideoMedia, AudioVideoMediaStatus, IAudioVideoMediaCreate } from "@core/shared/domain/value-objects/audio-video-media.vo";
import { IMediaFile } from "@core/shared/domain/value-objects/image-media.vo";

export interface ITrailerCreate extends Omit<IAudioVideoMediaCreate, 'encoded_location' | 'status'> { }
export interface ITrailerCreateFromFile extends IMediaFile { }

export class Trailer extends AudioVideoMedia {
  static max_size = 500 * 1024 * 1024;  // 500MB
  static mime_types = ['video/mp4'];

  static createFromFile(props: ITrailerCreateFromFile): Either<Trailer> {
    return Either.safe(() => {
      const { name } = MediaFileValidator.create(Trailer.max_size, Trailer.mime_types)
        .validate(props);

      return Trailer.create({
        name: `${props.video_id.id}-${name}`,
        raw_location: `videos/${props.video_id.id}/videos`,
      });
    });
  }

  static create(props: ITrailerCreate) {
    return new Trailer({
      ...props,
      status: AudioVideoMediaStatus.PENDING,
    });
  }
  
  process() {
    return new Trailer({
      name: this.name,
      raw_location: this.raw_location,
      encoded_location: this.encoded_location,
      status: AudioVideoMediaStatus.PROCESSING,
    });
  }

  completed(encoded_location: string) {
    return new Trailer({
      name: this.name,
      raw_location: this.raw_location,
      encoded_location,
      status: AudioVideoMediaStatus.COMPLETED,
    });
  }

  fail() {
    return new Trailer({
      name: this.name,
      raw_location: this.raw_location,
      encoded_location: this.encoded_location,
      status: AudioVideoMediaStatus.FAILED,
    });
  }

}