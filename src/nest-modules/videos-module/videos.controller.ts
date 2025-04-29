import { CreateVideoUseCase } from '@core/video/application/create-video/create-video.use-case';
import { GetVideoUseCase } from '@core/video/application/get-video/get-video.use-case';
import { UpdateVideoUseCase } from '@core/video/application/update-video/update-video.use-case';
import { UploadAudioVideoMediasUseCase } from '@core/video/application/upload-audio-video-medias/upload-audio-video-medias.use-case';
import { Body, Controller, Inject, Post } from '@nestjs/common';

@Controller('videos')
export class VideosController {

  @Inject(CreateVideoUseCase)
  private readonly createUseCase: CreateVideoUseCase;

  @Inject(UpdateVideoUseCase)
  private readonly updateUseCase: UpdateVideoUseCase;

  @Inject(UploadAudioVideoMediasUseCase)
  private readonly uploadAudioVideoMediasUseCase: UploadAudioVideoMediasUseCase;

  @Inject(GetVideoUseCase)
  private readonly getUseCase: GetVideoUseCase;
}
