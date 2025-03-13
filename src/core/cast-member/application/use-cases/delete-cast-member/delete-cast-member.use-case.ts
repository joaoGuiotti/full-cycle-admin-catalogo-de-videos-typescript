import { CastMemberId } from "@core/cast-member/domain/cast-member.aggregate";
import { ICastMemberRepository } from "@core/cast-member/domain/cast-member.repository";
import { IUseCase } from "@core/shared/application/use-case.interface";

export class DeleteCastMemberUseCase
  implements IUseCase<DeleteCastMemberInput, DeleteCastMemberOutput> {

  constructor(private readonly castMemberRepo: ICastMemberRepository) { }

  async execute(input: DeleteCastMemberInput): Promise<DeleteCastMemberOutput> {
    const uuid = new CastMemberId(input.id);
    await this.castMemberRepo.delete(uuid);
  }
}

export type DeleteCastMemberInput = {
  id: string;
}

export type DeleteCastMemberOutput = void;