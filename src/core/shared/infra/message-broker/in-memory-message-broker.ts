import { IMessageBroker } from "@core/shared/application/message-broker.interface";
import { IDomainEvent } from "@core/shared/domain/events/domain-event.interafce";


export class InMemoryMessageBroker implements IMessageBroker {
  private handlers: { [key: string]: (event: IDomainEvent) => Promise<void> } = {}

  async publishEvent(event: IDomainEvent): Promise<void> {
    const handler = this.handlers[event.constructor.name];
    if (handler)
      await handler(event)
  }

  public subscribe<T extends IDomainEvent>(
    event: { new(...args: any[]): T },
    handler: (event: T) => Promise<void>,
  ): void {
    this.handlers[event.name] = handler;
  }

  public unsubscribe<T extends IDomainEvent>(
    event: { new(...args: any[]): T },
  ): void {
    delete this.handlers[event.name];
  }
}