import { IDomainEventHandler } from "@core/shared/application/domain-event.handler.interafce";
import { VideoAudioMediaReplacedEvent } from "@core/video/domain/events/video-audio-media-replaced.event";
import { OnEvent } from "@nestjs/event-emitter";

export class PublishVideoMediaReplacedQueueHandler 
  implements IDomainEventHandler<VideoAudioMediaReplacedEvent> { 

  @OnEvent(VideoAudioMediaReplacedEvent.name)
  async handle(event: VideoAudioMediaReplacedEvent): Promise<void> {
    console.log('Video media replaced:', event);
  }

}

//agreagados que disparam eventos 
