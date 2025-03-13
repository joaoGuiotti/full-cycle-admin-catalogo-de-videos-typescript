import { IUseCase } from "@core/shared/application/use-case.interface";
import { CastMemberOutput, CastMemberOutputMapper } from "../common/cast-member-output";
import { UpdateCastMemberInput } from "./update-cast-member.input";
import { ICastMemberRepository } from "@core/cast-member/domain/cast-member.repository";
import { CastMember, CastMemberId } from "@core/cast-member/domain/cast-member.aggregate";
import { NotFoundError } from "@core/shared/domain/errors/not-found.error";
import { EntityValidationError } from "@core/shared/domain/validators/validation.error";

export type UpdateCastMemberOutput = CastMemberOutput;

export class UpdateCastMemberUseCase
  implements IUseCase<UpdateCastMemberInput, UpdateCastMemberOutput> {

  constructor(private readonly repo: ICastMemberRepository) { }

  async execute(input: UpdateCastMemberInput): Promise<CastMemberOutput> {
    const uuid = new CastMemberId(input.id);
    const castMember = await this.repo.findById(uuid);

    if (!castMember) {
      throw new NotFoundError(input.id, CastMember);
    }

    if (input.name !== undefined) {
      castMember.changeName(input.name);
    }

    if (input.type !== undefined) {
      castMember.changeType(input.type);
    }

    if (castMember.notification.hasErrors()) {
      throw new EntityValidationError(castMember.notification.toJSON());
    }

    await this.repo.update(castMember);

    return CastMemberOutputMapper.toOutput(castMember);
  }

}