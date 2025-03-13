import { Entity } from "../../../../domain/entity";
import { NotFoundError } from "../../../../domain/errors/not-found.error";
import { Uuid } from "../../../../domain/value-objects/uuid.vo";
import { InMemoryRepository } from "../in-memory.repository";

type StubEntityConstructorProps = {
  entity_id?: Uuid;
  name: string;
  price: number;
}

class StubEntity extends Entity {
  entity_id: Uuid;
  name: string;
  price: number;

  constructor(props: StubEntityConstructorProps) {
    super();
    props = { ...props, entity_id: props.entity_id ?? new Uuid() };
    Object.assign(this, props);
  }

  toJSON() {
    return {
      entity_id: this.entity_id.id,
      name: this.name,
      price: this.price
    }
  }

}

class StubInMemoryRepository extends InMemoryRepository<StubEntity, Uuid> {
  getEntity(): new (...args: any[]) => StubEntity {
    return StubEntity;
  }
}

describe('In MemoryRepository Unit Test', () => {
  let repo: StubInMemoryRepository;

  beforeEach(() => {
    repo = new StubInMemoryRepository();
  });

  it('Should insert a new entity', async () => {
    const enity = new StubEntity({
      entity_id: new Uuid(),
      name: 'Test',
      price: 100,
    });

    await repo.insert(enity);
    expect(repo.items.length).toBe(1);
    expect(repo.items[0]).toBe(enity);
  });

  it('Should bulk insert entities', async () => {
    const entities = [
      new StubEntity({
        entity_id: new Uuid(),
        name: 'Test 1',
        price: 1
      }),
      new StubEntity({
        entity_id: new Uuid(),
        name: 'Test 2',
        price: 2,
      })
    ];

    await repo.bulkInsert(entities);
    expect(repo.items.length).toBe(2);
    expect(repo.items[0]).toBe(entities[0]);
    expect(repo.items[1]).toBe(entities[1]);
  });

  it('Should returns all entities', async () => {
    const aggregate = new StubEntity({ name: "Name", price: 5 });
    await repo.insert(aggregate);
    const entities = await repo.findAll();
    expect(entities).toStrictEqual([aggregate]);
  });

  it('Should returns an entity by entity id', async () => {
    const aggregate = new StubEntity({ name: "Name", price: 5 });
    await repo.insert(aggregate);
    const entityFound = await repo.findById(aggregate.entity_id);
    expect(entityFound?.entity_id).toBe(aggregate.entity_id);
  });

  it('Should throw error on update when entity not found', async () => {
    const entity = new StubEntity({ name: "Name", price: 5 });
    await expect(repo.update(entity)).rejects.toThrow(
      new NotFoundError(entity.entity_id, StubEntity)
    );
  });

  it('Should update entity', async () => {
    const entity = new StubEntity({ name: "Name", price: 5 });
    await repo.insert(entity);

    const updatedEntity = new StubEntity({
      ...entity,
      name: 'updated entity'
    });

    await repo.update(updatedEntity);
    expect(repo.items[0]).toBe(updatedEntity);
    expect(repo.items[0].name).toBe('updated entity');
  });
  it('Should delete a entity using entity id', async () => {
    const entities = [
      new StubEntity({
        entity_id: new Uuid(),
        name: 'Test 1',
        price: 1
      }),
      new StubEntity({
        entity_id: new Uuid(),
        name: 'Test 2',
        price: 2,
      })
    ];
    await repo.bulkInsert(entities);
    await repo.delete(entities[1].entity_id);
    expect(repo.items).toHaveLength(1);
  });

  it('Should throw error when delete a not found entity using entity id', async () => {
    const entity = new StubEntity({ name: "Name", price: 5 });

    await expect(repo.delete(entity.entity_id)).rejects.toThrow(
      new NotFoundError(entity.entity_id, StubEntity)
    );
  });
})