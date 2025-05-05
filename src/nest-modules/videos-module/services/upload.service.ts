import { Inject, Injectable, ValidationPipe } from '@nestjs/common';
import { UploadFileDto, VideoFiles } from '../dto/upload-file.dto';
import { UploadAudioVideoMediasUseCase } from '@core/video/application/use-cases';

@Injectable()
export class VideoUploadService {

  @Inject(UploadAudioVideoMediasUseCase)
  private readonly uploadAudioVideoMediasUseCase: UploadAudioVideoMediasUseCase;

  isAudioVideoMedia(files: VideoFiles): boolean {
    return !!(files.trailer?.length || files.video?.length);
  }

  private createAudioVidoMediaDto(videoId: string, files: VideoFiles): UploadFileDto {
    const fileField = Object.keys(files)[0] as keyof VideoFiles;
    const file = files[fileField]?.[0] as any;

    return {
      video_id: videoId,
      field: fileField as any,
      file: {
        raw_name: file.originalname,
        data: file.buffer,
        mime_type: file.mimetype,
        size: file.size,
      }
    }
  }

  async uploadFile(id: string, files: VideoFiles,): Promise<void> {
    if (this.isAudioVideoMedia(files)) {
      const dto = this.createAudioVidoMediaDto(id, files);
      const data = await new ValidationPipe({ errorHttpStatusCode: 422 })
        .transform(dto, {
          metatype: UploadFileDto,
          type: 'body',
        });
      await this.uploadAudioVideoMediasUseCase.execute(data);
    } else {
      // use case upload image media
    }
  }

}