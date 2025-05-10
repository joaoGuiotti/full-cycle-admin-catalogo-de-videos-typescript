import { VideoId } from '../../../domain/video.aggregate';
import { IUseCase } from '../../../../shared/application/use-case.interface';
import { UploadAudioVideoMediaInput } from './upload-audio-video-medias.input';
import { IStorage } from '../../../../shared/application/storage.interafce';
import { IVideoRepository } from '../../../../video/domain/video.repository';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error';
import { Video } from '../../../../video/domain/video.aggregate';
import { Trailer } from '../../../../video/domain/trailer.vo';
import { VideoMedia } from '../../../../video/domain/video-media.vo';
import { EntityValidationError } from '../../../../shared/domain/validators/validation.error';
import { ApplicationService } from '../../../../shared/application/application.service';

export type UploadAudioVideoMediaOutput = void;

export class UploadAudioVideoMediasUseCase
  implements IUseCase<UploadAudioVideoMediaInput, UploadAudioVideoMediaOutput> {

  constructor(
    private appService: ApplicationService,
    private readonly videoRepo: IVideoRepository,
    private readonly storage: IStorage,
  ) { }

  async execute(input: UploadAudioVideoMediaInput): Promise<UploadAudioVideoMediaOutput> {
    const { video_id, field, file } = input;
    const video = await this.videoRepo.findById(new VideoId(video_id));
    if (!video) throw new NotFoundError(video_id, Video);
    const audioVideoMediaMap = {
      trailer: Trailer,
      video: VideoMedia,
    };

    const [audioVideoMedia, error] = audioVideoMediaMap[field].createFromFile({
      ...file,
      video_id: video.video_id,
    }).asArray();

    if (error)
      throw new EntityValidationError([
        { [field]: [error.message] }
      ]);

    audioVideoMedia instanceof VideoMedia && video.replaceVideo(audioVideoMedia);
    audioVideoMedia instanceof Trailer && video.replaceTrailer(audioVideoMedia);
    
    await this.storage.store({
      data: file.data,
      mime_type: file.mime_type,
      id: audioVideoMedia.raw_url,
    });

    await this.appService.run(async () => {
      return this.videoRepo.update(video);
    });
  }
}

// clean architecture
// 1. duplication  
// - intentional
// - acidental
