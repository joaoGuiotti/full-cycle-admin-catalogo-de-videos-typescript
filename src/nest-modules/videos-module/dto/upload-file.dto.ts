import { UploadAudioVideoMediaInput } from "@core/video/application/use-cases";

export class UploadFileDto extends UploadAudioVideoMediaInput { }

export interface VideoFiles {
  banner?: Express.Multer.File[];
  thumbnail?: Express.Multer.File[];
  thumbnail_half?: Express.Multer.File[];
  trailer?: Express.Multer.File[];
  video?: Express.Multer.File[];
}