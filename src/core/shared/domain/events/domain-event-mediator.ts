import EventEmitter2 from "eventemitter2";
import { AggregateRoot } from "../aggregate-root";

export class DomainEventMediator { 
  constructor(private readonly eventEmitter: EventEmitter2) {}

  register(eventName: string, handler: any) {
    this.eventEmitter.on(eventName, handler);
  }

  async publish(aggregateRoot: AggregateRoot) {
    for (const event of aggregateRoot.events) {
      const eventClassName = event.constructor.name;
      await this.eventEmitter.emitAsync(eventClassName, event);
    }
  }
}