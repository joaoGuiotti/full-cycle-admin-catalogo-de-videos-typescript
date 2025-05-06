import { IMessageBroker } from "@core/shared/application/message-broker.interface";
import { IDomainEvent } from "@core/shared/domain/events/domain-event.interafce";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { EVENTS_MESSAGE_BROKER_CONFIG } from "./events-message-broker-config";

export class RabbitMQMessageBroker implements IMessageBroker {

  constructor(private readonly conn: AmqpConnection) { }

  async publishEvent(event: IDomainEvent): Promise<void> {
    const { exchange, routing_key } = EVENTS_MESSAGE_BROKER_CONFIG[event.constructor.name]
    await this.conn.publish(exchange, routing_key, event);
  }
 
}