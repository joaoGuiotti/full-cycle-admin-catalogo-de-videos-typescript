import { VideoAudioMediaUploadedIntegrationEvent } from "../../../video/domain/events/video-audio-media-replaced.event";

export const EVENTS_MESSAGE_BROKER_CONFIG: EventMessageBrokerConfig = {
  [VideoAudioMediaUploadedIntegrationEvent.name]: {
    exchange: 'amq.direct',
    routing_key: VideoAudioMediaUploadedIntegrationEvent.name,
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