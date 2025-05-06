import { IIntegrationEventHandler } from "@core/shared/application/domain-event.handler.interafce";
import { VideoAudioMediaUploadedIntegrationEvent } from "@core/video/domain/events/video-audio-media-replaced.event";
import { OnEvent } from "@nestjs/event-emitter";

export class PublishVideoMediaReplacedQueueHandler
  implements IIntegrationEventHandler {

  @OnEvent(VideoAudioMediaUploadedIntegrationEvent.name)
  async handle(event: VideoAudioMediaUploadedIntegrationEvent): Promise<void> {
    console.log('Video media replaced:', event);
  }

}

// evntos de dominio, são aqueles que os agreagados disparam 
// eventos de integração - outros subdominios
