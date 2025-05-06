import { VideoAudioMediaReplacedEvent } from "@core/video/domain/events/video-audio-media-replaced.event";

export const EVENTS_MESSAGE_BROKER_CONFIG: EventMessageBrokerConfig = {
  [VideoAudioMediaReplacedEvent.name]: {
    exchange: 'amq.direct',
    routing_key: VideoAudioMediaReplacedEvent.name,
  },
  TestEvent: {
    exchange: 'test-exchange',
    routing_key: 'TestEvent',
  },
};

export type EventMessageBrokerConfig = { [key: string]: MessageBrokerConfigData };

type MessageBrokerConfigData = {
  exchange: string;
  routing_key: string;
}