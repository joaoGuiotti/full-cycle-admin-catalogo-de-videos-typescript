import { ValueObject } from "../value-object";
import { MediaFileValidator } from "../validators/media-file.validator";
import { VideoId } from "../../../video/domain/video.aggregate";

export interface IMediaFile {
  raw_name: string;
  mime_type: string;
  size: number;
  video_id: VideoId;
}

export abstract class ImageMedia extends ValueObject {

  constructor(
    readonly name: string,
    readonly location: string,
  ) {
    super();
  }

  static validate(props: IMediaFile, max_size: number, mimes_types: string[]) {
    return MediaFileValidator.validate(
      props,
      max_size,
      mimes_types
    );
  }

  get url(): string {
    return `${this.location}/${this.name}`;
  }

  toJSON() {
    return {
      name: this.name,
      location: this.location,
    };
  };
}