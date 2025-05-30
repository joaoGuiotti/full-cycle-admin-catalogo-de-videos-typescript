import { AudioVideoMediaStatus } from "@core/shared/domain/value-objects/audio-video-media.vo";
import { ProcessMediasInput, ProcessMediasUseCase } from "@core/video/application/use-cases";
import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import { Inject, Injectable, UseFilters, ValidationPipe } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { RabbitmqConsumeErrorFilter } from "src/nest-modules/rabbitmq-module/filters/rabbitmq-consume-error.filter";
import { RabbitMQConstants } from "src/nest-modules/rabbitmq-module/rabbitmq.constants";

@UseFilters(RabbitmqConsumeErrorFilter)
@Injectable()
export class VideosConsumersServices {

  @Inject(ModuleRef)
  private readonly moduleRef: ModuleRef;

  @RabbitSubscribe({
    exchange: RabbitMQConstants.EXCHANGES.DELAYED,
    routingKey: 'videos.convert',
    queue: 'micro-videos/admin',
    allowNonJsonMessages: true,
    queueOptions: {
      deadLetterExchange: RabbitMQConstants.EXCHANGES.DLX,
      deadLetterRoutingKey: 'videos.convert',
      durable: true,
      // messageTtl: 5000 - tempo de vida da mensagem na fila para ser republicada
    },
  })
  async onProcessVideo(message: {
    video: {
      resource_id: string;  //video__id.field
      encoded_video_folder: string;
      status: 'COMPLETED' | 'FAILED';
    }
  }) {
    // console.log('onProcessVideo ====>', message);
    const resource_id = `${message.video?.resource_id ?? ''}`;
    const [video_id, field] = resource_id.split('.');
    const input = new ProcessMediasInput({
      video_id,
      field: field as 'trailer' | 'video',
      encoded_location: message.video?.encoded_video_folder,
      status: message.video?.status?.toLowerCase() as AudioVideoMediaStatus
    });
    await new ValidationPipe({
      errorHttpStatusCode: 422,
    }).transform(input, {
      metatype: ProcessMediasInput,
      type: 'body',
    });
    const useCase = await this.moduleRef.resolve(ProcessMediasUseCase);
    await useCase.execute(input);
  }
}

// Deadletter queue - log 

// class FakeError extends Error {
//   constructor() {
//     super('FakeError');
//   }
// }

