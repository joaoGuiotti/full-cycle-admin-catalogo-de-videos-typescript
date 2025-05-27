import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { VideoUploadService } from './services/upload.service';
import { VideoFiles } from './dto/upload-file.dto';
import {
  CreateVideoUseCase,
  GetVideoUseCase,
  UpdateVideoInput,
  UpdateVideoUseCase,
} from '@core/video/application/use-cases';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { AuthGuard, AdminGuard } from '../auth-module/guards';

@Controller('videos')
@UseGuards(AuthGuard, AdminGuard)
export class VideosController {
  @Inject(CreateVideoUseCase)
  private readonly createUseCase: CreateVideoUseCase;

  @Inject(UpdateVideoUseCase)
  private readonly updateUseCase: UpdateVideoUseCase;

  @Inject(VideoUploadService)
  private readonly videoUploadService: VideoUploadService;

  @Inject(GetVideoUseCase)
  private readonly getUseCase: GetVideoUseCase;

  @Post()
  async create(@Body() createVideoDto: CreateVideoDto) {
    const { id } = await this.createUseCase.execute(createVideoDto);
    //VideoPresenter
    return await this.getUseCase.execute({ id });
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    //VideoPresenter
    return await this.getUseCase.execute({ id });
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'banner', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
      { name: 'thumbnail_half', maxCount: 1 },
      { name: 'trailer', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  async update(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @Body() updateVideoDto: any,
    @UploadedFiles() files: Partial<VideoFiles> = {},
  ) {
    const hasFiles = Object.keys(files).length > 0;
    const hasData = Object.keys(updateVideoDto).length > 0;

    if (hasFiles && hasData)
      throw new BadRequestException('Files and data cannot be sent together');

    if (hasData) {
      const data = await new ValidationPipe({
        errorHttpStatusCode: 422,
      }).transform(updateVideoDto, {
        metatype: UpdateVideoDto,
        type: 'body',
      });
      const input = new UpdateVideoInput({ id, ...data });
      await this.updateUseCase.execute(input);
    }

    const hasMoreThanOneFile = Object.keys(files).length > 1;

    if (hasMoreThanOneFile)
      throw new BadRequestException('Only one file can be sent at a time');

    await this.videoUploadService.uploadFile(id, files);
    return await this.getUseCase.execute({ id });
  }

  @Patch(':id/upload')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'banner', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
      { name: 'thumbnail_half', maxCount: 1 },
      { name: 'trailer', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  async uploadFile(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @UploadedFiles() files: Partial<VideoFiles> = {},
  ) {
    if (Object.keys(files).length > 1) {
      throw new BadRequestException('Only one file can be sent at a time');
    }
    await this.videoUploadService.uploadFile(id, files);
    return await this.getUseCase.execute({ id });
  }
}
