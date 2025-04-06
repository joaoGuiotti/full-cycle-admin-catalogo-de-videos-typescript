import { AggregateRoot } from "../aggregate-root";
import { IDomainEvent } from "../events/domain-event.interafce";
import { Uuid } from "../value-objects/uuid.vo";

class StubEvent implements IDomainEvent {
  event_version: number = 1;
  ocurrend_on: Date;

  constructor(
    public aggregate_id: Uuid,
    public name: string
  ) {
    this.ocurrend_on = new Date();
  }
}

class StubAggreagteRoot extends AggregateRoot {
  aggregate_id: Uuid;
  name: string;
  field1: string;

  constructor(name: string, id?: Uuid) {
    super();
    this.aggregate_id = id ? id : new Uuid(id);
    this.name = name;
    this.registerHandler(StubEvent.name, this.onStubEvent.bind(this));
  }

  get entity_id() {
    return this.aggregate_id;
  }

  operation() {
    this.name = this.name.toUpperCase();
    this.applyEvent(new StubEvent(this.aggregate_id, this.name));
  }

  onStubEvent(event: StubEvent) {
    this.field1 = event.name;
  }

  toJSON() {
    return {
      id: this.aggregate_id.id,
      name: this.name,
      field1: this.field1
    }
  }
}

describe('AggregateRoot Unit Tests', () => {

  it('dispatch events', () => {
    const id = new Uuid();
    const aggregate = new StubAggreagteRoot('test name', id);
    aggregate.operation();
    expect(aggregate.field1).toBe('TEST NAME')
  });

});