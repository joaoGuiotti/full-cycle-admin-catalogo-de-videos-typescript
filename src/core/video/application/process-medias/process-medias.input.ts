import { AudioVideoMediaStatus } from "../../../shared/domain/value-objects/audio-video-media.vo";
import { IsIn, IsNotEmpty, IsString, IsUUID, MaxLength, validateSync } from "class-validator";


export type ProcessMediasInputConstructorProps = {
  video_id: string;
  field: 'trailer' | 'video';
  status: AudioVideoMediaStatus;
  encoded_location: string;
};

export class ProcessMediasInput {
  @IsUUID('4')
  @IsString()
  @IsNotEmpty()
  video_id: string;

  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  encoded_location: string;

  @IsIn(['trailer', 'video'])
  @IsNotEmpty()
  field: 'trailer' | 'video';

  @IsIn([AudioVideoMediaStatus.COMPLETED, AudioVideoMediaStatus.FAILED])
  @IsNotEmpty()
  status: AudioVideoMediaStatus;

  constructor(props?: ProcessMediasInputConstructorProps) {
    if (!props) return;
    this.video_id = props.video_id;
    this.encoded_location = props.encoded_location;
    this.field = props.field;
    this.status = props.status;
  }
}

export class ValidateProcessMediasInput {
  static validate(input: ProcessMediasInput) {
    return validateSync(input);
  }
}

