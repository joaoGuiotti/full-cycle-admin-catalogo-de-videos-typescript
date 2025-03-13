import { IsEnum, MaxLength } from "class-validator";
import { CastMember, CastMemberTypes } from "./cast-member.aggregate";
import { ClassValidatorFields } from "@core/shared/domain/validators/class-validator-fields";
import { Notification } from "@core/shared/domain/validators/notification";

export class CastMemberRules {
  @MaxLength(255, { groups: ['name'] })
  name: string;

  constructor(enity: CastMember) {
    Object.assign(this, enity);
  }
}

export class CastMemberValidator extends ClassValidatorFields {
  validate(notification: Notification, data: any, fields?: string[]): boolean {
    const newFields = fields?.length ? fields : ['name'];
    return super.validate(notification, new CastMemberRules(data), newFields);
  }
}

export class CastMemberValidatorFactory {
  static create() {
    return new CastMemberValidator();
  }
}