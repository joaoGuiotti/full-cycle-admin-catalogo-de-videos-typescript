import { CastMemberTypes } from "@core/cast-member/domain/cast-member-type.vo";
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, validateSync } from "class-validator";

export type CreateCastMemberInputConstructorProps = {
  name: string;
  type: CastMemberTypes;
}

export class CreateCastMemberInput {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsNotEmpty()
  type: CastMemberTypes;

  constructor(props?: CreateCastMemberInputConstructorProps) {
    if (!props) return;
    this.name = props.name;
    this.type = props.type;
  }
}

export class ValidadeCreateCastMemberInput {
  static validate(input: CreateCastMemberInput) {
    return validateSync(input);
  }
}