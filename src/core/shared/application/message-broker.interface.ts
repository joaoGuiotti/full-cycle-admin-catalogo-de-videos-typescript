import { IDomainEvent } from "../domain/events/domain-event.interafce";

export interface IMessageBroker {
  publishEvent(event: IDomainEvent): Promise<void>;
}