import { RabbitMQMessageBroker } from '@core/shared/infra/message-broker/rabbitmq-message-broker';
import { AmqpConnection, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitmqConsumeErrorFilter } from './filters/rabbitmq-consume-error.filter';
import { RabbitMQConstants } from './rabbitmq.constants';

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
                name: RabbitMQConstants.EXCHANGES.DLX,
                type: RabbitMQConstants.CONFIG.EXCHANGE_TYPES.TOPIC,
                options: {
                  durable: true
                }
              },
              {
                name: RabbitMQConstants.EXCHANGES.DELAYED,
                type: RabbitMQConstants.CONFIG.EXCHANGE_TYPES.DELAYED_MESSAGE,
                options: {
                  arguments: {
                    'x-delayed-type': 'direct'
                  }
                }
              }
            ],
            queues: [
              {
                name: RabbitMQConstants.QUEUES.DLX,
                exchange: RabbitMQConstants.EXCHANGES.DLX,
                routingKey: RabbitMQConstants.ROUTING_KEYS.ALL,
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
      providers: [RabbitmqConsumeErrorFilter],
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
