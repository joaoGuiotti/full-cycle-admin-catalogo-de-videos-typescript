import { Nullable } from "../nullable";
import { ValueObject } from "../value-object";

export enum AudioVideoMediaStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface IAudioVideoMediaCreate {
  name: string;
  raw_location: string; //mp4
  encoded_location?: Nullable<string>; // mpeg-dash (mpd) fragments
  status: AudioVideoMediaStatus;
}

export abstract class AudioVideoMedia extends ValueObject {
  readonly name: string;
  readonly raw_location: string; // mp4
  readonly encoded_location?: Nullable<string>; // mpeg-dash (mpd) fragments
  readonly status: AudioVideoMediaStatus;

  abstract process(): AudioVideoMedia;
  abstract complete(encoded_location: string): AudioVideoMedia;
  abstract fail(): AudioVideoMedia;

  constructor(props: IAudioVideoMediaCreate) {
    super();
    this.name = props.name;
    this.raw_location = props.raw_location;
    this.encoded_location = props.encoded_location ?? null;
    this.status = props.status;
  }

  get raw_url(): string {
    return `${this.raw_location}/${this.name}`;
  }

  toJSON() {
    return {
      name: this.name,
      raw_location: this.raw_location,
      encoded_location: this.encoded_location,
      status: this.status,
    };
  };
}