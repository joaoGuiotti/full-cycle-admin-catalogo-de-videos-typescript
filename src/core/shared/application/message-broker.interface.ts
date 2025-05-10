import { IDomainEvent, IIntegrationEvent } from "../domain/events/domain-event.interafce";

export interface IMessageBroker {
  publishEvent(event: IIntegrationEvent): Promise<void>;
}