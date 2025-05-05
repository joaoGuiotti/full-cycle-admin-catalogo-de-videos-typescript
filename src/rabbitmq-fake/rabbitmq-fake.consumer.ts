import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";

export class RabbitMQFakeConsumer {

  @RabbitSubscribe({
    exchange: 'amq.direct',
    queue: 'fake-queue',
    routingKey: 'fake-key',
  })
  handle(message: string) {
    console.log(message);
  }
}