import { IDomainEvent } from './../domain/events/domain-event.interafce';

export interface IDomainEventHandler<T extends IDomainEvent> { 
  handle(event: T): Promise<void>;
}