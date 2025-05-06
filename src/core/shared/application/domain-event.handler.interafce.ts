import { IDomainEvent, IIntegrationEvent } from './../domain/events/domain-event.interafce';

export interface IDomainEventHandler {
  handle(event: IDomainEvent): Promise<void>;
}

export interface IIntegrationEventHandler {
  handle(event: IIntegrationEvent): Promise<void>;
}