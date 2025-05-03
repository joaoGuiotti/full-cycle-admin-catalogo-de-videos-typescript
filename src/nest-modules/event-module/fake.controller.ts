import { Controller, Get } from "@nestjs/common";
import EventEmitter2 from "eventemitter2";

@Controller('fake-event')
export class FakeController {

  constructor(
    private readonly eventEmitter: EventEmitter2,
  ) { }

  @Get()
  dispatchEvent() { 
    this.eventEmitter.emit('fake.event', { data: 'Hello, World!' });
    return { message: 'Event dispatched!' };
  }
}