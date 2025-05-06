import { DomainEventMediator } from "../domain/events/domain-event-mediator";
import { IUnitOfWork } from "../domain/repository/unit-of-work.interface";

export class ApplicationService {

  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly domainEventMediator: DomainEventMediator,
  ) { }

  async start() {
    await this.unitOfWork.start();
  }

  async commit() {
    const aggregateRoots = [...this.unitOfWork.getAggregateRoots()];
    for (const aggregateRoot of aggregateRoots) {
      await this.domainEventMediator.publish(aggregateRoot);
    }
    await this.unitOfWork.commit();
    for (const aggregateRoot of aggregateRoots) {
      await this.domainEventMediator.publishIntegrationEvents(aggregateRoot);
    }
  }

  async rollback() {
    await this.unitOfWork.rollback();
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