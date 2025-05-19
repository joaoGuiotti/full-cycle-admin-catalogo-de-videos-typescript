import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { DynamicModule } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "src/nest-modules/config-module/config.module";
import { DatabaseModule } from "src/nest-modules/database-module/database.module";
import { EventModule } from "src/nest-modules/event-module/event.module";
import { SharedModule } from "src/nest-modules/shared-module/shared.module";
import { UseCaseModule } from "src/nest-modules/use-case-module/use-case.module";
import { VideosModule } from "../videos.module";
import { UnitOfWorkFakeInMemory } from "src/core/shared/infra/db/in-memory/fake-unit-of-work-in-memory";
import EventEmitter2 from "eventemitter2";
import { VideoAudioMediaUploadedIntegrationEvent } from "src/core/video/domain/events/video-audio-media-replaced.event";
import { AuthModule } from "src/nest-modules/auth-module/auth.module";

class RabbitmqModuleFake {
  static forRoot(): DynamicModule {
    return {
      module: RabbitmqModuleFake,
      global: true,
      providers: [
        {
          provide: AmqpConnection,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
      exports: [AmqpConnection],
    };
  }
}

describe('VideosModule Unit Tests', () => {
  let module: TestingModule;
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        SharedModule,
        EventModule,
        UseCaseModule,
        DatabaseModule,
        RabbitmqModuleFake.forRoot(),
        AuthModule,
        VideosModule,
      ],
    })
      .overrideProvider('UnitOfWork')
      .useFactory({
        factory: () => {
          return new UnitOfWorkFakeInMemory();
        },
      })
      // .overrideProvider(ApplicationService)
      // .useFactory({
      //   factory: (
      //     uow: UnitOfWorkSequelize,
      //     domainEventMediator: DomainEventMediator,
      //   ) => {
      //     return new ApplicationService(uow, domainEventMediator);
      //   },
      //   inject: ['UnitOfWork', DomainEventMediator],
      // })
      .compile();
      await module.init();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should register events', async () => {
    const evtEmitter2 = module.get<EventEmitter2>(EventEmitter2);
    expect(
      evtEmitter2.listeners(VideoAudioMediaUploadedIntegrationEvent.name)
    ).toHaveLength(1);
  })

});