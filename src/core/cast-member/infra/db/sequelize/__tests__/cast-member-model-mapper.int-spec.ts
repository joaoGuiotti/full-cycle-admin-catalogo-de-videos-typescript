import { CastMember, CastMemberTypes } from "@core/cast-member/domain/cast-member.aggregate";
import { EntityValidationError } from "../../../../../shared/domain/validators/validation.error";
import { Uuid } from "../../../../../shared/domain/value-objects/uuid.vo";
import { setupSequelize } from "../../../../../shared/infra/helpers/helpers";
import { CastMemberModel } from "../cast-member.model";
import { CastMemberModelMapper } from "../cast-member-mapper";


describe('CastMemberModelMapper Integration Test', () => {

  setupSequelize({ models: [CastMemberModel] });

  it('Should throw error when category is invalid', () => {
    expect.assertions(2);
    const model = CastMemberModel.build({
      cast_member_id: '9366b7dc-2d71-4799-b91c-c64adb205104',
      name: 'a'.repeat(256),
      type: CastMemberTypes.ACTOR,
      created_at: new Date()
    });
    try {
      CastMemberModelMapper.toEntity(model)
      fail('The Category is valid, but it needs throw a EntityValidationError');
    } catch (e) {
      expect(e).toBeInstanceOf(EntityValidationError);
      expect((e as EntityValidationError).error).toMatchObject([
        {
          'name': ['name must be shorter than or equal to 255 characters'],
        }
      ]);
    }
  });

  it('should convert a category model to a category entity', () => {
    const created_at = new Date();
    const model = CastMemberModel.build({
      cast_member_id: '5490020a-e866-4229-9adc-aa44b83234c4',
      name: 'some value',
      type: CastMemberTypes.ACTOR,
      created_at,
    });
    const entity = CastMemberModelMapper.toEntity(model);


    expect(entity.toJSON()).toStrictEqual(
      new CastMember({
        cast_member_id: new Uuid('5490020a-e866-4229-9adc-aa44b83234c4'),
        name: 'some value',
        type: CastMemberTypes.ACTOR,
        created_at,
      }).toJSON()
    );
  });

});