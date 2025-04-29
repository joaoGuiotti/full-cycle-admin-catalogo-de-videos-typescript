import { NotFoundError } from "../../../shared/domain/errors/not-found.error";
import { AudioVideoMedia, AudioVideoMediaStatus } from "../../../shared/domain/value-objects/audio-video-media.vo";
import { Video, VideoId } from "../../../video/domain/video.aggregate";
import { IVideoRepository } from "../../../video/domain/video.repository";
import { ProcessMediasInput } from "./process-medias.input";
import { IUseCase } from "../../../shared/application/use-case.interface";
import { IUnitOfWork } from "../../../shared/domain/repository/unit-of-work.interface";

type ProcessMediasOutput = void;

export class ProcessMediasUseCase
  implements IUseCase<ProcessMediasInput, ProcessMediasOutput> {

  constructor(
    private uow: IUnitOfWork,
    private videoRepo: IVideoRepository,
  ) { }

  async execute(input: ProcessMediasInput): Promise<ProcessMediasOutput> {
    const video = await this.getVideo(input.video_id);
    this.processMediaField(video, input);
    this.uow.do(async (uow) => {
      await this.videoRepo.update(video);
    });
  }

  private async getVideo(id: string): Promise<Video> {
    const videoId = new VideoId(id);
    const video = await this.videoRepo.findById(videoId);

    if (!video) {
      throw new NotFoundError(id, Video);
    }

    return video;
  }

  private processMediaField(video: Video, input: ProcessMediasInput): void {
    const mediaProcessors = {
      trailer: () => this.processTrailer(video, input),
      video: () => this.processVideo(video, input)
    };

    const processor = mediaProcessors[input.field];
    if (!processor) {
      throw new Error(`Invalid media field: ${input.field}`);
    }

    processor();
  }

  private processTrailer(video: Video, input: ProcessMediasInput): void {
    if (!video.trailer) {
      throw new Error('Trailer not found');
    }

    video.trailer = this.updateMediaStatus(
      video.trailer,
      input.status,
      input.encoded_location
    );
  }

  private processVideo(video: Video, input: ProcessMediasInput): void {
    if (!video.video) {
      throw new Error('Video not found');
    }

    video.video = this.updateMediaStatus(
      video.video,
      input.status,
      input.encoded_location
    );
  }

  private updateMediaStatus(
    media: AudioVideoMedia,
    status: AudioVideoMediaStatus,
    encodedLocation?: string
  ): AudioVideoMedia {
    return status === AudioVideoMediaStatus.COMPLETED
      ? media.complete(encodedLocation!)
      : media.fail();
  }
}