import { ValueObject } from "@core/shared/domain/value-object";
import { Uuid } from "@core/shared/domain/value-objects/uuid.vo";
import { CastMemberValidatorFactory } from "./cast-member.validator";
import { CastMemberFakeBuilder } from "./cast-member-fake.builder";
import { AggreagateRoot } from "@core/shared/domain/aggregate-root";
import { Notification } from "@core/shared/domain/validators/notification";

export enum CastMemberTypes {
  DIRECTOR = 1,
  ACTOR = 2,
}

export type CastMemberConstructorProps = {
  cast_member_id?: Uuid;
  name: string;
  type: CastMemberTypes;
  created_at?: Date;
}

export type CastMemberCreateCommand = { 
  name: string;
  type: CastMemberTypes;
  created_at?: Date;
}

export class CastMemberId extends Uuid {}

export class CastMember extends AggreagateRoot {
  cast_member_id: CastMemberId;
  name: string;
  type: CastMemberTypes;
  created_at: Date;

  constructor(props: CastMemberConstructorProps) {
    super();
    this.cast_member_id = props.cast_member_id ?? new CastMemberId();
    this.name = props.name;
    this.type = props.type;
    this.created_at = props.created_at ?? new Date();
  }

  get entity_id(): ValueObject {
    return this.cast_member_id;
  }

  static create(props: CastMemberCreateCommand): CastMember {
    const category = new CastMember(props);
    category.validate(['name']);
    return category;
  }

  changeName(name: string) {
    this.name = name;
    this.validate(['name']);
  }

  changeType(type: CastMemberTypes) {
    this.type = type;
  }

  validate(fields?: string[]) {
    const validator = CastMemberValidatorFactory.create();
    return validator.validate(this.notification, this, fields);
  }

  static fake() {
    return CastMemberFakeBuilder<CastMember>;
  }

  toJSON() {
    return  {
      cast_member_id: this.cast_member_id.id,
      name: this.name,
      type: this.type,
      created_at: this.created_at
    }
  }
}