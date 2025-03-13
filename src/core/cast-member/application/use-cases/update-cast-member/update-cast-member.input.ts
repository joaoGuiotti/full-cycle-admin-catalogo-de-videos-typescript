import { CastMemberTypes } from "@core/cast-member/domain/cast-member.aggregate";
import { IsInt, IsNotEmpty, IsString, validateSync } from "class-validator";

export type UpdateCastMemberInputConstructorProps = {
  id: string;
  name: string;
  type: CastMemberTypes;
}

export class UpdateCastMemberInput {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsNotEmpty()
  type: CastMemberTypes;

  constructor(props: UpdateCastMemberInputConstructorProps) {
    if (!props) return;
    this.id = props.id;
    props.name && (this.name = props.name);
    props.type && (this.type = props.type);
  }
}

export class CalidateUpdateCastMemberInput {
  static validate(input: UpdateCastMemberInput) {
    return validateSync(input);
  }
}