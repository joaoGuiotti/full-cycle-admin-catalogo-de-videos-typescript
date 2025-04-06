import { ValueObject } from "../value-object";

export interface IDomainEvent {
  aggregate_id: ValueObject;
  ocurrend_on: Date;
  event_version: number;
}