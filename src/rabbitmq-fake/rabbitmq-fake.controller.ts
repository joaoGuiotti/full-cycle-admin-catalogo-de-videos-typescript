import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { Controller, Get } from "@nestjs/common";

@Controller('rabbitmq-fake')
export class RabbitMQFakeController {

  constructor(private readonly amqpConnection: AmqpConnection) { }

  @Get()
  async publishMessage() {
    await this.amqpConnection.publish('amq.direct', 'fake-key', {
      message: 'Hello World',
    });
  }

}