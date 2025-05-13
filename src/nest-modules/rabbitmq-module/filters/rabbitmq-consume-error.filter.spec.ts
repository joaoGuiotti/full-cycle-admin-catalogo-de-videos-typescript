import { Test, TestingModule } from '@nestjs/testing';
import { AmqpConnection, Nack } from '@golevelup/nestjs-rabbitmq';
import { RabbitmqConsumeErrorFilter } from './rabbitmq-consume-error.filter';
import { ArgumentsHost } from '@nestjs/common';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';

describe('RabbitmqConsumeErrorFilter Unit Tests', () => {
  let filter: RabbitmqConsumeErrorFilter;
  let amqpConn: AmqpConnection;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RabbitmqConsumeErrorFilter,
        {
          provide: AmqpConnection,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();
    filter = module.get<RabbitmqConsumeErrorFilter>(RabbitmqConsumeErrorFilter);
    amqpConn = module.get<AmqpConnection>(AmqpConnection);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {

    it('should not retry if error is in NON_RETRIABLE_ERRORS', async () => {
      const host = {
        getType: jest.fn().mockReturnValue('rmq'),
        switchToRpc: jest.fn(),
      } as unknown as ArgumentsHost;

      const error = new EntityValidationError([
        { key: ['value'] }
      ]);

      const result = await filter.catch(error, host);
      expect(host.getType).toHaveBeenCalled();
      expect(result).toEqual(new Nack(false));
      expect(host.switchToRpc).not.toHaveBeenCalled();
    });
  });

  it('should retry if error is retriable and retry count is less than max retries', async () => {
    const host = {
      getType: jest.fn().mockReturnValue('rmq'),
      switchToRpc: jest.fn().mockReturnValue({
        getContext: jest.fn().mockReturnValue({
          properties:{ headers: { [RabbitmqConsumeErrorFilter.RETRY_COUNT_HEADER]: 1 } },
          content: Buffer.from('test message'),
          fields: { routingKey: 'test' },
        }),
      }),
    } as unknown as ArgumentsHost;
    const error = new Error('Test error');

    await filter.catch(error, host);
    expect(amqpConn.publish).toHaveBeenCalled();
    expect(amqpConn.publish).toHaveBeenCalledWith(
      RabbitmqConsumeErrorFilter.RETRY_EXCHANGE,
      'test',
      Buffer.from('test message'),
      {
        correlationId: undefined,
        headers: {
          [RabbitmqConsumeErrorFilter.RETRY_COUNT_HEADER]: 2,
          'x-delay': 5000,
        },
      }
    );
  });
}); 
