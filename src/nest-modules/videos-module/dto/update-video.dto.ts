import { UpdateVideoInput } from "@core/video/application/use-cases";
import { OmitType } from "@nestjs/mapped-types";

export class UpdateVideoInputWithoutId
  extends OmitType(UpdateVideoInput, ['id']) { };

export class UpdateVideoDto
  extends UpdateVideoInputWithoutId { };