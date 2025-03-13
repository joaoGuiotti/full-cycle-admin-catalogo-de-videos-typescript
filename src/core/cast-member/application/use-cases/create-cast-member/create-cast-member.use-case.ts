import { EntityValidationError } from "@core/shared/domain/validators/validation.error";
import { IUseCase } from "../../../../shared/application/use-case.interface";
import { CreateCastMemberInput } from "./create-cast-member.input";
import { ICastMemberRepository } from "@core/cast-member/domain/cast-member.repository";
import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";
import { CastMemberOutput, CastMemberOutputMapper } from "../common/cast-member-output";
 
export class CreateCastMemberUseCase
  implements IUseCase<CreateCastMemberInput, CreateCastMemberOutput> {

  constructor(private readonly categoryRepo: ICastMemberRepository) { }

  async execute(input: CreateCastMemberInput): Promise<CreateCastMemberOutput> {
    const entity = CastMember.create(input);

    if(entity.notification.hasErrors()) {
      throw new EntityValidationError(entity.notification.toJSON());
    }

    await this.categoryRepo.insert(entity);

    return CastMemberOutputMapper.toOutput(entity);
  }
}

export type CreateCastMemberOutput = CastMemberOutput;