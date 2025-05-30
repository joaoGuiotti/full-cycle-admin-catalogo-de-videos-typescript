import EventEmitter2 from "eventemitter2";
import { AggregateRoot } from "../aggregate-root";

export class DomainEventMediator {
  constructor(private readonly eventEmitter: EventEmitter2) { }

  register(eventName: string, handler: any) {
    this.eventEmitter.on(eventName, handler);
  }

  async publish(aggregateRoot: AggregateRoot) {
    for (const event of aggregateRoot.getUncommittedEvents()) {
      const eventClassName = event.constructor.name;
      aggregateRoot.markEventAsDispatched(event);
      await this.eventEmitter.emitAsync(eventClassName, event);
    }
  }

  async publishIntegrationEvents(aggregateRoot: AggregateRoot) {
    for (const event of aggregateRoot.events) {
      const integrationEvent = event.getIntegrationEvent?.();
      if (!integrationEvent) continue;
      await this.eventEmitter.emitAsync(
        integrationEvent.constructor.name,
        integrationEvent,
      );
    }
  }
}