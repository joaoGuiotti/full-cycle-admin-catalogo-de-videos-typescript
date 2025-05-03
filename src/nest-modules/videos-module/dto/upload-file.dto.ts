import { UploadAudioVideoMediaInput } from '@core/video/application/upload-audio-video-medias/upload-audio-video-medias.input';

export class UploadFileDto extends UploadAudioVideoMediaInput { }

export interface VideoFiles {
  banner?: Express.Multer.File[];
  thumbnail?: Express.Multer.File[];
  thumbnail_half?: Express.Multer.File[];
  trailer?: Express.Multer.File[];
  video?: Express.Multer.File[];
}