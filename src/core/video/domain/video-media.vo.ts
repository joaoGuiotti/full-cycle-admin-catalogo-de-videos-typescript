import { Either } from "@core/shared/domain/either";
import { MediaFileValidator } from "@core/shared/domain/validators/media-file.validator";
import { AudioVideoMedia, AudioVideoMediaStatus, IAudioVideoMediaCreate } from "@core/shared/domain/value-objects/audio-video-media.vo";
import { IMediaFile } from "@core/shared/domain/value-objects/image-media.vo";

export interface IVideoMediaCreate extends Omit<IAudioVideoMediaCreate, 'encoded_location' | 'status'> { }
export interface IVideoMediaCreateFromFile extends IMediaFile { }

export class VideoMedia extends AudioVideoMedia {
  static max_size = 50 * 1024 * 1024 * 1024; // 50GB
  static mime_types = ['video/mp4'];

  static createFromFile(props: IVideoMediaCreateFromFile): Either<VideoMedia> {
    return Either.safe(() => {
      const { name } = MediaFileValidator.create(VideoMedia.max_size, VideoMedia.mime_types)
        .validate(props);

      return VideoMedia.create({
        name: `${props.video_id.id}-${name}`,
        raw_location: `videos/${props.video_id.id}/videos`,
      });
    });
  }

  static create(props: IVideoMediaCreate) {
    return new VideoMedia({
      ...props,
      status: AudioVideoMediaStatus.PENDING,
    });
  }
  
  process() {
    return new VideoMedia({
      name: this.name,
      raw_location: this.raw_location,
      encoded_location: this.encoded_location,
      status: AudioVideoMediaStatus.PROCESSING,
    });
  }

  complete(encoded_location: string) {
    return new VideoMedia({
      name: this.name,
      raw_location: this.raw_location,
      encoded_location,
      status: AudioVideoMediaStatus.COMPLETED,
    });
  }

  fail() {
    return new VideoMedia({
      name: this.name,
      raw_location: this.raw_location,
      encoded_location: this.encoded_location,
      status: AudioVideoMediaStatus.FAILED,
    });
  }

}