import { ConsumeMessage, MessagePropertyHeaders } from 'amqplib';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { AmqpConnection, Nack } from '@golevelup/nestjs-rabbitmq';
import { ArgumentsHost, Catch, ExceptionFilter, UnprocessableEntityException } from '@nestjs/common';

@Catch()
export class RabbitmqConsumeErrorFilter<T = Error> implements ExceptionFilter {
  static readonly RETRY_COUNT_HEADER = 'x-retry-count';
  static readonly MAX_RETRIES = 10;

  static readonly NON_RETRIABLE_ERRORS = [
    NotFoundError,
    EntityValidationError,
    UnprocessableEntityException,
  ];

  constructor(private readonly amqpConn: AmqpConnection) { }

  async catch(exception: T, host: ArgumentsHost) {
    if (host.getType<'rmq'>() !== 'rmq')
      return;

    const hasRetriableError = RabbitmqConsumeErrorFilter
      .NON_RETRIABLE_ERRORS.some(
        error => exception instanceof error
      );

    if (hasRetriableError)
      return new Nack(false);

    const ctx = host.switchToRpc();
    const message: ConsumeMessage = ctx.getContext();

    console.error('RabbitMQConsumeErrorFilter - Exception ===>', exception);
    console.error(
      'RabbitMQConsumeErrorFilter - Retry Count ===>',
      message.properties?.headers?.[RabbitmqConsumeErrorFilter.RETRY_COUNT_HEADER]
    );

    if (!this.shouldRetry(message.properties.headers!))
      return new Nack(false);

    return await this.retry(message);
  }

  private shouldRetry(messageHeaders: MessagePropertyHeaders): boolean {
    const retryCount = messageHeaders[RabbitmqConsumeErrorFilter.RETRY_COUNT_HEADER];
    return !(RabbitmqConsumeErrorFilter.RETRY_COUNT_HEADER in messageHeaders)
      || retryCount < RabbitmqConsumeErrorFilter.MAX_RETRIES;
  }

  private retry(message: ConsumeMessage) {
    const headers: any = message.properties!.headers;
    const retryCount = headers[RabbitmqConsumeErrorFilter.RETRY_COUNT_HEADER] || 0;
    headers[RabbitmqConsumeErrorFilter.RETRY_COUNT_HEADER] = retryCount + 1;
    headers['x-delay'] = 5000; // 5s
    return this.amqpConn.publish(
      'direct.delayed',
      message.fields.routingKey,
      message.content,
      {
        correlationId: message.properties.correlationId,
        headers
      }
    );
  }
}


