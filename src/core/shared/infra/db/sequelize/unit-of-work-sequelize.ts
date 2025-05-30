import { Sequelize, Transaction } from "sequelize";
import { IUnitOfWork } from "../../../domain/repository/unit-of-work.interface";
import { Nullable } from "../../../domain/nullable";
import { AggregateRoot } from "../../../../shared/domain/aggregate-root";

export class UnitOfWorkSequelize implements IUnitOfWork {
  private transaction: Nullable<Transaction>;
  private aggregateRoots: Set<AggregateRoot> = new Set<AggregateRoot>();

  constructor(private sequelzie: Sequelize) { }

  async start(): Promise<void> {
    if (!this.transaction) {
      this.transaction = await this.sequelzie.transaction();
    }
  }

  async commit(): Promise<void> {
    this.validateTransaction();
    await this.transaction!.commit();
    this.resetTransaction();
  }

  async rollback(): Promise<void> {
    this.validateTransaction();
    await this.transaction!.rollback();
    this.resetTransaction();
  }

  getTransaction() {
    return this.transaction;
  }

  async do<T>(workFn: (IUnitOfWork) => Promise<T>): Promise<T> {
    let isAutoTransaction = false;
    try {
      if (this.transaction) {
        const result = await workFn(this);
        this.resetTransaction();
        return result;
      }
      return await this.sequelzie.transaction(async (t) => {
        isAutoTransaction = true;
        this.transaction = t;
        const result = await workFn(this);
        this.resetTransaction();
        return result;
      });
    } catch (e) {
      if (!isAutoTransaction)
        this.transaction?.rollback();
      this.resetTransaction();
      throw e;
    }
  }

  private validateTransaction() {
    if (!this.transaction) {
      throw new Error('No transaction started');
    }
  }

  private resetTransaction() {
    this.transaction = null;
  }

  addAggregateRoot(aggregateRoot: AggregateRoot): void {
    this.aggregateRoots.add(aggregateRoot);
  }

  getAggregateRoots(): AggregateRoot[] {
    return [...this.aggregateRoots];
  }

  addCollectionAggregateRoot(aggregateRoot: AggregateRoot[]): void { 
    aggregateRoot.forEach((aggregate) => {
      this.aggregateRoots.add(aggregate);
    });
  }

}