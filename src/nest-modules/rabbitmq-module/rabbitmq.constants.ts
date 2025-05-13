export class RabbitMQConstants {
  static readonly EXCHANGES = {
    DLX: 'dlx.exchange',
    DELAYED: 'direct.delayed'
  } as const;

  static readonly QUEUES = {
    DLX: 'dlx.queue',
    ADMIN: 'micro-videos/admin'
  } as const;

  static readonly ROUTING_KEYS = {
    ALL: '#',
    VIDEO_CONVERT: 'videos.convert'
  } as const;

  static readonly HEADERS = {
    RETRY_COUNT: 'x-retry-count',
    DELAY: 'x-delay'
  } as const;

  static readonly CONFIG = {
    MAX_RETRIES: 10,
    DELAY_MS: 5000, // 5 seconds
    EXCHANGE_TYPES: {
      TOPIC: 'topic',
      DELAYED_MESSAGE: 'x-delayed-message'
    }
  } as const;
}