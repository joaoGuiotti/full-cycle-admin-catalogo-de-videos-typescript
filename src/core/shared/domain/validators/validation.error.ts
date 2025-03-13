import { FieldsErrors } from "./validator-fields-interface";

export abstract class BaseValidationError extends Error {
  constructor(
    public error: FieldsErrors[],
    message = 'Validation Error',
  ) {
    super(message);
  }

  count() {
    return Object.keys(this.error).length;
  }
}

export class EntityValidationError extends BaseValidationError {
  constructor(public error: FieldsErrors[]) {
    super(error, 'Entity Validation Error');
    this.name = 'EntityValidationError';
  }
}