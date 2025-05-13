import { RabbitMQMessageBroker } from '@core/shared/infra/message-broker/rabbitmq-message-broker';
import { AmqpConnection, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitmqConsumeErrorFilter } from './filters/rabbitmq-consume-error.filter';

@Module({})
export class RabbitmqModule {

  static forRoot(): DynamicModule {
    return {
      module: RabbitmqModule,
      imports: [
        RabbitMQModule.forRootAsync({
          useFactory: (configService: ConfigService) => ({
            uri: configService.get('RABBITMQ_URI') as string,
            exchanges: [
              {
                name: 'dlx.exchange',
                type: 'topic',
                options: {
                  durable: true
                }
              },
              {
                name: 'direct.delayed',
                type: 'x-delayed-message',
                options: {
                  arguments: {
                    'x-delayed-type': 'direct'
                  }
                }
              }
            ],
            queues: [
              {
                name: 'dlx.queue',
                exchange: 'dlx.exchange',
                routingKey: '#',
                createQueueIfNotExists: true,
              }
            ],
            connectionManagerOptions: {
              heartbeatIntervalInSeconds: 15,
              reconnectTimeInSeconds: 30,
            }
          }),
          inject: [ConfigService],
        }),
      ],
      providers: [
        RabbitmqConsumeErrorFilter
      ],
      global: true,
      exports: [RabbitMQModule],
    }
  }

  static forFeature(): DynamicModule {
    return {
      module: RabbitmqModule,
      providers: [
        {
          provide: 'IMessageBroker',
          useFactory: (amqpConnection: AmqpConnection) => {
            return new RabbitMQMessageBroker(amqpConnection);
          },
          inject: [AmqpConnection],
        },
      ],
      exports: ['IMessageBroker'],
    };
  }
}
