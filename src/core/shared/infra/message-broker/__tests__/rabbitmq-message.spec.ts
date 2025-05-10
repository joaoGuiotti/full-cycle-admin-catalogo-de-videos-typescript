import { IIntegrationEvent } from "@core/shared/domain/events/domain-event.interafce";
import { RabbitMQMessageBroker } from "../rabbitmq-message-broker";
import { ChannelWrapper } from 'amqp-connection-manager';
import { Uuid } from "@core/shared/domain/value-objects/uuid.vo";
import { EVENTS_MESSAGE_BROKER_CONFIG } from "../events-message-broker-config";

class TestEvent implements IIntegrationEvent {
  occurred_on: Date = new Date();
  event_version: number = 1;
  event_name: string = TestEvent.name;
  constructor(readonly payload: any) { }
}

describe('RabbitMQMessageBroker Unit Tests', () => {
  let service: RabbitMQMessageBroker;
  let connection: ChannelWrapper;
  beforeEach(async () => {
    connection = {
      publish: jest.fn(),
    } as any;
    service = new RabbitMQMessageBroker(connection as any);
  });

  describe('publish', () => {
    it('should puclish events to the channel', async () => {
      const event = new TestEvent(new Uuid());
      await service.publishEvent(event);
      expect(connection.publish).toHaveBeenCalledWith(
        EVENTS_MESSAGE_BROKER_CONFIG[TestEvent.name].exchange,
        EVENTS_MESSAGE_BROKER_CONFIG[TestEvent.name].routing_key,
        event,
      );
    });
  });

});