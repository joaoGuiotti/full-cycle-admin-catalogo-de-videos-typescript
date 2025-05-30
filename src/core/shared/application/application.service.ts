import { DomainEventMediator } from "../domain/events/domain-event-mediator";
import { IUnitOfWork } from "../domain/repository/unit-of-work.interface";

export class ApplicationService {

  constructor(
    private readonly uow: IUnitOfWork,
    private readonly domainEventMediator: DomainEventMediator,
  ) { }

  async start() {
    await this.uow.start();
  }

  async commit() {
    const aggregateRoots = [...this.uow.getAggregateRoots()];
    for (const aggregateRoot of aggregateRoots) {
      await this.domainEventMediator.publish(aggregateRoot);
    }

    await this.uow.commit();

    for (const aggregateRoot of aggregateRoots) {
      await this.domainEventMediator.publishIntegrationEvents(aggregateRoot);
    }
  }

  async rollback() {
    await this.uow.rollback();
  }

  async run<T>(callbackFn: () => Promise<T>): Promise<T> {
    await this.start();
    try {
      const result = await callbackFn();
      await this.commit();
      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }

}