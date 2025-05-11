import { AudioVideoMediaStatus } from "@core/shared/domain/value-objects/audio-video-media.vo";
import { ProcessMediasInput } from "@core/video/application/use-cases";
import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import { Injectable, ValidationPipe } from "@nestjs/common";

const FILE_RESOURCE_REGEX = /^.+\.[a-zA-Z0-9]+$/;

@Injectable()
export class VideosConsumersServices {
  @RabbitSubscribe({
    exchange: 'amq.direct',
    routingKey: 'videos.convert',
    queue: 'micro-videos/admin',
    allowNonJsonMessages: true,
  })
  async onProcessVideo(message: {
    video: {
      resource_id: string;  //video__id.field
      encoded_video_folder: string;
      status: 'COMPLETED' | 'FAILED';
    }
  }) {
    const resource_id = `${message.video?.resource_id ?? ''}`;
    const [video_id, field] = resource_id.split('.');
    const input = new ProcessMediasInput({
      video_id,
      field: field as 'trailer' | 'video',
      encoded_location: message.video?.encoded_video_folder,
      status: message.video?.status as AudioVideoMediaStatus
    });

    try {
      await new ValidationPipe({
        errorHttpStatusCode: 422,
      }).transform(input, {
        metatype: ProcessMediasInput,
        type: 'body',
      });
    } catch (error) {
      console.error(error);
    }
    console.log('success', resource_id);
  }
}

// Deadletter queue - log 
