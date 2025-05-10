import { IIntegrationEventHandler } from "@core/shared/application/domain-event.handler.interafce";
import { IMessageBroker } from "@core/shared/application/message-broker.interface";
import { VideoAudioMediaUploadedIntegrationEvent } from "@core/video/domain/events/video-audio-media-replaced.event";
import { OnEvent } from "@nestjs/event-emitter";

export class PublishVideoMediaReplacedQueueHandler
  implements IIntegrationEventHandler {

  constructor(private messageBroker: IMessageBroker) { }

  @OnEvent(VideoAudioMediaUploadedIntegrationEvent.name)
  async handle(event: VideoAudioMediaUploadedIntegrationEvent): Promise<void> {
    await this.messageBroker.publishEvent(event);
  }

}

// evntos de dominio, são aqueles que os agreagados disparam 
// eventos de integração - outros subdominios
