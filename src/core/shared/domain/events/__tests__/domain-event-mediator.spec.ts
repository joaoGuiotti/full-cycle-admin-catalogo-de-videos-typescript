import EventEmitter2 from "eventemitter2";
import { AggregateRoot } from "../../aggregate-root";
import { ValueObject } from "../../value-object";
import { Uuid } from "../../value-objects/uuid.vo";
import { DomainEventMediator } from "../domain-event-mediator";
import { IDomainEvent } from "../domain-event.interafce";

class StubEvent implements IDomainEvent {
  occurred_on: Date;
  event_version: number;

  constructor(public aggregate_id: Uuid, public name: string) {
    this.occurred_on = new Date();
    this.event_version = 1;
  }
}

class StubAggregateRoot extends AggregateRoot {
  id: Uuid;
  name: string;

  get entity_id(): ValueObject {
    return this.id;
  }

  action(name: string) {
    this.name = name;
    this.applyEvent(new StubEvent(this.id, this.name));
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
    };
  }
}

describe("DomainEventMediator Unit Tests", () => {
  let mediator: DomainEventMediator;

  beforeEach(() => {
    const eventEmitter = new EventEmitter2();
    mediator = new DomainEventMediator(eventEmitter);
  });

  it('should publish handler', async () => {
    expect.assertions(2);
    mediator.register(StubEvent.name, (event: StubEvent) => {
      expect(event).toBeInstanceOf(StubEvent);
      expect(event.name).toBe('test');
    });

    const aggregate = new StubAggregateRoot();
    aggregate.action('test');
    await mediator.publish(aggregate)
  });
});


