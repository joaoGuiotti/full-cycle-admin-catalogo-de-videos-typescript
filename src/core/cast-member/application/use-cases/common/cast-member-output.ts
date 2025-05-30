import { CastMemberTypes } from "@core/cast-member/domain/cast-member-type.vo";
import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";

export type CastMemberOutput = {
  id: string;
  name: string;
  type: number;
  created_at: Date;
};

export class CastMemberOutputMapper {
  static toOutput(entity: CastMember): CastMemberOutput {
    const { cast_member_id, ...other_props } = entity.toJSON();
    return {
      id: cast_member_id,
      ...other_props,
    };
  }
}
