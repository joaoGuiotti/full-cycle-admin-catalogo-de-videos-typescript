import { CastMember, CastMemberTypes } from "@core/cast-member/domain/cast-member.aggregate";
import { CastMemberOutputMapper } from "./cast-member-output";

describe('CastMemberOutputMapper', () => {
  it('should convert a category in output', () => {
    const entity = CastMember.create({
      name: 'Movie',
      type: CastMemberTypes.ACTOR,
    });
    const spyToJson = jest.spyOn(entity, 'toJSON');
    const output = CastMemberOutputMapper.toOutput(entity);
    expect(spyToJson).toHaveBeenCalled();
    expect(output).toStrictEqual({
      id: entity.cast_member_id.id,
      name: 'Movie',
      type: 2,
      created_at: entity.created_at
    });
  });
});