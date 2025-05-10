import { IMessageBroker } from "@core/shared/application/message-broker.interface";
import { IIntegrationEvent } from "@core/shared/domain/events/domain-event.interafce";

export class InMemoryMessageBroker implements IMessageBroker {
  private handlers: { [key: string]: (event: IIntegrationEvent) => Promise<void> } = {}

  async publishEvent(event: IIntegrationEvent): Promise<void> {
    const handler = this.handlers[event.constructor.name];
    if (handler)
      await handler(event)
  }

  public subscribe<T extends IIntegrationEvent>(
    event: { new(...args: any[]): T },
    handler: (event: T) => Promise<void>,
  ): void {
    this.handlers[event.name] = handler;
  }

  public unsubscribe<T extends IIntegrationEvent>(
    event: { new(...args: any[]): T },
  ): void {
    delete this.handlers[event.name];
  }
}