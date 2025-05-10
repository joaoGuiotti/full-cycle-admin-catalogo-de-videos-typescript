import { IDomainEvent, IIntegrationEvent } from "../../../shared/domain/events/domain-event.interafce";
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

  getIntegrationEvent(): IIntegrationEvent {
    return new VideoAudioMediaUploadedIntegrationEvent(this);
  }
}

export class VideoAudioMediaUploadedIntegrationEvent
  implements IIntegrationEvent {
  declare event_name: string;
  declare event_version: number;
  declare occurred_on: Date;
  declare payload: any;

  constructor(event: VideoAudioMediaReplacedEvent) {
    this.event_name = this.constructor.name;
    this['resource_id'] = `${event.aggregate_id.id}.${event.media_type}`;
    this['file_path'] = event.media.raw_url;
  }
}