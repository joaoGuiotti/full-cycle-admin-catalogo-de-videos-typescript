import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";
import { CastMemberModel } from "./cast-member.model";
import { Uuid } from "@core/shared/domain/value-objects/uuid.vo";
import { EntityValidationError } from "@core/shared/domain/validators/validation.error";

export class CastMemberModelMapper {
  static toModel(entity: CastMember): CastMemberModel {
    return CastMemberModel.build({
      cast_member_id: entity.cast_member_id.id,
      name: entity.name,
      type: entity.type,
      created_at: entity.created_at
    })
  }

  static toEntity(model: CastMemberModel): CastMember {
    const entity = new CastMember({
      cast_member_id: new Uuid(model.cast_member_id),
      name: model.name,
      type: model.type,
      created_at: model.created_at
    });
    entity.validate();
    if(entity.notification.hasErrors())  {
      throw new EntityValidationError(entity.notification.toJSON())
    }
    return entity;
  }
}