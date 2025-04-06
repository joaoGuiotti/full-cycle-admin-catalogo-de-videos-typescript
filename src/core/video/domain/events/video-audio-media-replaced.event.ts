import { IDomainEvent } from "@core/shared/domain/events/domain-event.interafce";
import { ValueObject } from "@core/shared/domain/value-object";
import { VideoId } from "../video.aggregate";
import { Trailer } from "../trailer.vo";
import { VideoMedia } from "../video-media.vo";

type VideoAudioMediaReplacedProps = {
  aggregate_id: VideoId;
  media: Trailer | VideoMedia;
  media_type: 'trailer' | 'video';
}

export class VideoAudioMediaReplacedEvent implements IDomainEvent {
  readonly aggregate_id: VideoId;
  readonly occurred_on: Date;
  readonly event_version: number;

  readonly media: Trailer | VideoMedia;
  readonly media_type: 'trailer' | 'video';

  constructor(props: VideoAudioMediaReplacedProps) {
    this.occurred_on = new Date();
    this.event_version = 1;

    this.aggregate_id = props.aggregate_id;
    this.media = props.media;
    this.media_type = props.media_type;
  }

  static create(props: VideoAudioMediaReplacedProps) {
    return new VideoAudioMediaReplacedEvent(props)
  }
}