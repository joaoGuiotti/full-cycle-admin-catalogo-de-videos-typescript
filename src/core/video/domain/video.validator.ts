import { MaxLength } from "class-validator";
import { Video } from "./video.aggregate";
import { ClassValidatorFields } from "@core/shared/domain/validators/class-validator-fields";
import { Notification } from "@core/shared/domain/validators/notification";

export class VideoRules {
  @MaxLength(255, { groups: ['title'] })
  title: string;

  constructor(aggregate: Video) {
    this.title = aggregate.title;
  }
}

export class VideoValidator extends ClassValidatorFields {
  validate(notification: Notification, data: Video, fields?: string[]): boolean {
    const newFields = fields?.length ? fields : Object.keys(data);
    return super.validate(
      notification,
      new VideoRules(data),
      newFields,
    );
  }
}

export class VideoValidatorFactory {
  static create(): VideoValidator {
    return new VideoValidator();
  }
} 