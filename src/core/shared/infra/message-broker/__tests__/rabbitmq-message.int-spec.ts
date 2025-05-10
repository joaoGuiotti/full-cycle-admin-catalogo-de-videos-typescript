import { IIntegrationEvent } from "@core/shared/domain/events/domain-event.interafce";
import { RabbitMQMessageBroker } from "../rabbitmq-message-broker";
import { Uuid } from "@core/shared/domain/value-objects/uuid.vo";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { Config } from "../../config";

class TestEvent implements IIntegrationEvent {
  occurred_on: Date = new Date();
  event_version: number = 1;
  event_name: string = TestEvent.name;
  constructor(readonly payload: any) { }
}

describe('RabbitMQMessageBroker Integration Tests', () => {
  let service: RabbitMQMessageBroker;
  let connection: AmqpConnection;
  beforeEach(async () => {
    connection = new AmqpConnection({
      uri: Config.rabbitmqUri(),
      connectionInitOptions: { wait: true },
      logger: {
        debug: () => {},
        error: () => {},
        info: () => {},
        warn: () => {},
        log: () => {},
      } as any,
    });

    await connection.init();
    const channel = connection.channel;

    await channel.assertExchange('test-exchange', 'direct', {
      durable: false,
    });
    await channel.assertQueue('test-queue', { durable: false });
    await channel.purgeQueue('test-queue');
    await channel.bindQueue('test-queue', 'test-exchange', 'TestEvent');
    service = new RabbitMQMessageBroker(connection);
  });

  afterEach(async () => {
    try {
      await connection.managedConnection.close();
    } catch (err) {}
  });

  describe('publish', () => {
    it('should publish events to channel', async () => { 
      const event = new TestEvent(new Uuid());
      await service.publishEvent(event);
      const msg: any = await new Promise((resolve) => {
        connection.channel.consume('test-queue', (msg) => {
          resolve(msg as any);
        });
      });
      const msgObj = JSON.parse(msg.content.toString());
      expect(msgObj).toEqual({
        payload: event.payload,
        event_version: 1,
        event_name: event.event_name,
        occurred_on: event.occurred_on.toISOString()
      });
    });
  });

});