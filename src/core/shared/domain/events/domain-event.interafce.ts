import { ValueObject } from "../value-object";

export interface IDomainEvent {
  aggregate_id: ValueObject;
  occurred_on: Date;
  event_version: number;

  getIntegrationEvent?(): IIntegrationEvent;
}

export interface IIntegrationEvent<T = any> {
  event_name: string;
  event_version: number;
  occurred_on: Date;
  payload: T;
}
// Evento de integrção é disparado após o evento de dominio
