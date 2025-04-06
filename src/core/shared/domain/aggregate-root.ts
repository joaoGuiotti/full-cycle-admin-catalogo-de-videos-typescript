import { Entity } from "./entity";
import { IDomainEvent } from "./events/domain-event.interafce";
import EventEmitter2 from "eventemitter2";

export abstract class AggregateRoot extends Entity {
  private readonly events: Set<IDomainEvent> = new Set<IDomainEvent>();
  private readonly localMediator = new EventEmitter2();

  applyEvent(event: IDomainEvent) {
    this.events.add(event);
    this.localMediator.emit(event.constructor.name, event);
  }

  registerHandler(event: string, handler: (event: IDomainEvent) => void) {
    this.localMediator.on(event, handler);
  }
}
// Aggregate lida com algo que é uma raiz de agregação, ou seja, algo que é a raiz de um conjunto de entidades.
// Principalmente com os eventos de domínio