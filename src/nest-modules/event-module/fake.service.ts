import { Injectable } from "@nestjs/common";
import { EventEmitterModule, OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class FakeService {

  @OnEvent('fake.event')
  handle(event: any) {
    console.log('Event received:', event);
  }
}