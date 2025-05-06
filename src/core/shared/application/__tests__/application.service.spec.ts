import { DomainEventMediator } from "../../../shared/domain/events/domain-event-mediator";
import { IUnitOfWork } from "../../../shared/domain/repository/unit-of-work.interface";
import { ApplicationService } from "../application.service";
import { UnitOfWorkFakeInMemory } from "../../../shared/infra/db/in-memory/fake-unit-of-work-in-memory";
import EventEmitter2 from "eventemitter2";
import { AggregateRoot } from "../../../shared/domain/aggregate-root";
import { ValueObject } from "../../../shared/domain/value-object";
import { IIntegrationEvent } from "@core/shared/domain/events/domain-event.interafce";

class StubAggregateRoot extends AggregateRoot {
  get entity_id(): ValueObject {
    throw new Error("Method not implemented.");
  }
  toJSON() {
    throw new Error("Method not implemented.");
  }
}

describe('ApplicationService Unit Tests', () => {
  let uow: IUnitOfWork;
  let domainEventMediator: DomainEventMediator;
  let appService: ApplicationService;

  beforeEach(() => {
    uow = new UnitOfWorkFakeInMemory();
    const eventEmitter = new EventEmitter2();
    domainEventMediator = new DomainEventMediator(eventEmitter);
    appService = new ApplicationService(uow, domainEventMediator);
  });

  describe('start', () => {
    it('should call start on unitOfWork', async () => {
      const startSpy = jest.spyOn(uow, 'start');
      await appService.start();
      expect(startSpy).toHaveBeenCalled();
    });
  });

  describe('fail', () => {
    it('should call rollback on unitOfWork', async () => {
      const rollbackSpy = jest.spyOn(uow, 'rollback');
      await appService.rollback();
      expect(rollbackSpy).toHaveBeenCalled();
    });
  });

  describe('finish', () => {
    it('should call the publish method of the domainEventMediator and the commit method', async () => {
      const aggregateRoot = new StubAggregateRoot();
      uow.addAggregateRoot(aggregateRoot);
      jest.spyOn(domainEventMediator, 'publish');
      jest.spyOn(domainEventMediator, 'publishIntegrationEvents');
      const commitSpy = jest.spyOn(uow, 'commit');
      await appService.commit();
      expect(domainEventMediator.publish).toHaveBeenCalledWith(aggregateRoot);
      expect(commitSpy).toHaveBeenCalled();
      expect(domainEventMediator.publishIntegrationEvents).toHaveBeenCalledWith(aggregateRoot);
    });
  });

  describe('run', () => {
    it('should call start, execute the callback function, commit and return the result', async () => {
      const startSpy = jest.spyOn(uow, 'start');
      const commitSpy = jest.spyOn(uow, 'commit');
      const callbackFn = jest.fn().mockResolvedValue('result');
      const result = await appService.run(callbackFn);
      expect(startSpy).toHaveBeenCalled();
      expect(commitSpy).toHaveBeenCalled();
      expect(result).toBe('result');
    });

    it('should rollback and throw an error if the callback function throws an error', async () => {
      const startSpy = jest.spyOn(uow, 'start');
      const rollbackSpy = jest.spyOn(uow, 'rollback');
      const failSpy = jest.spyOn(appService, 'rollback');
      const callbackFn = jest.fn().mockRejectedValue(new Error('error'));
      await expect(appService.run(callbackFn)).rejects.toThrow('error');
      expect(startSpy).toHaveBeenCalled();
      expect(rollbackSpy).toHaveBeenCalled();
      expect(failSpy).toHaveBeenCalled();
    });
  });
});