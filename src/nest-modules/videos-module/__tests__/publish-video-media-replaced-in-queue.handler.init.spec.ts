import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { ChannelWrapper } from 'amqp-connection-manager';
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from 'src/nest-modules/config-modules/config.module';
import { SharedModule } from 'src/nest-modules/shared-module/shared.module';
import { EventModule } from 'src/nest-modules/event-module/event.module';
import { UseCaseModule } from 'src/nest-modules/use-case-module/use-case.module';
import { DatabaseModule } from 'src/nest-modules/database-module/database.module';
import { VideosModule } from '../videos.module';
import { RabbitmqModule } from 'src/nest-modules/rabbitmq-module/rabbitmq.module';
import { Sequelize } from 'sequelize-typescript';
import { getConnectionToken } from '@nestjs/sequelize';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { EVENTS_MESSAGE_BROKER_CONFIG } from '@core/shared/infra/message-broker/events-message-broker-config';
import { VideoAudioMediaUploadedIntegrationEvent } from '@core/video/domain/events/video-audio-media-replaced.event';
import { Category } from '@core/category/domain/category.aggregate';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { Video } from '@core/video/domain/video.aggregate';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories-module/categories.provider';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { GENRES_PROVIDERS } from 'src/nest-modules/genres-module/genres.provider';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { CAST_MEMBERS_PROVIDERS } from 'src/nest-modules/cast-members-module/cast-members.provider';
import { IVideoRepository } from '@core/video/domain/video.repository';
import { VIDEOS_PROVIDERS } from '../videos.providers';
import { UploadAudioVideoMediasUseCase } from '@core/video/application/use-cases';
import { ConsumeMessage } from 'amqplib';

describe('PublishVideoMediaReplacedInQueueHandler Integration Tests', () => {
  let module: TestingModule;
  let channelWrapper: ChannelWrapper;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        SharedModule,
        EventModule,
        UseCaseModule,
        DatabaseModule,
        RabbitmqModule.forRoot(),
        VideosModule,
      ],
    }).overrideProvider('UnitOfWork')
      .useFactory({
        factory: (sequelize: Sequelize) => {
          return new UnitOfWorkSequelize(sequelize);
        },
        inject: [getConnectionToken()],
      })
      .compile();
    await module.init();

    const amqpConn = module.get<AmqpConnection>(AmqpConnection);
    channelWrapper = amqpConn.managedConnection.createChannel();
    await channelWrapper.addSetup((channel) => {
      const { exchange, routing_key } = EVENTS_MESSAGE_BROKER_CONFIG[VideoAudioMediaUploadedIntegrationEvent.name];
      return Promise.all([
        channel.assertQueue('test-queue-video-upload', {
          durable: false,
        }),
        channel.bindQueue(
          'test-queue-video-upload',
          exchange,
          routing_key,
        ),
      ]).then(() => channel.purgeQueue('test-queue-video-upload'));
    })
  });

  afterEach(async () => {
    await channelWrapper.close();
    await module.close();
  });

  it('should publish video media replaced event in queue', async () => {
    const category = Category.fake().aCategory().build();
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    const castMember = CastMember.fake().aDirector().build();
    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.category_id)
      .addGenreId(genre.genre_id)
      .addCastMemberId(castMember.cast_member_id)
      .build();

    const categoryRepo: ICategoryRepository = module.get(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
    await categoryRepo.insert(category);

    const genreRepo: IGenreRepository = module.get(
      GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
    );
    await genreRepo.insert(genre);

    const castMemberRepo: ICastMemberRepository = module.get(
      CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    );
    await castMemberRepo.insert(castMember);

    const videoRepo: IVideoRepository = module.get(
      VIDEOS_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide,
    );
    await videoRepo.insert(video);

    const useCase: UploadAudioVideoMediasUseCase = module.get(
      VIDEOS_PROVIDERS.USE_CASES.UPLOAD_AUDIO_VIDEO_MEDIA_USE_CASE.provide,
    );

    await useCase.execute({
      video_id: video.video_id.id,
      field: 'video',
      file: {
        data: Buffer.from('data'),
        mime_type: 'video/mp4',
        raw_name: 'video.mp4',
        size: 100,
      },
    });

    const msg: ConsumeMessage = await new Promise((resolve) => {
      channelWrapper.consume('test-queue-video-upload', (msg) => {
        resolve(msg);
      });
    });

    const msgObj = JSON.parse(msg.content.toString());
    const updatedVideo = await videoRepo.findById(video.video_id);
    expect(msgObj).toEqual({
      resource_id: `${video.video_id.id}.video`,
      file_path: updatedVideo?.video?.raw_url,
    });
  });
});