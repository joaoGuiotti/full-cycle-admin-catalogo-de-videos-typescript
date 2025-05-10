import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { GENRES_PROVIDERS } from '../genres-module/genres.provider';
import { UnitOfWorkSequelize } from "@core/shared/infra/db/sequelize/unit-of-work-sequelize";
import { VideoInMemoryRepository } from "@core/video/infra/db/in-memory/video-in-memory.repository";
import { VideoSequelizeRepository } from "@core/video/infra/db/sequelize/video-sequelize.repository";
import { VideoModel } from "@core/video/infra/db/sequelize/video.model";
import { getModelToken } from "@nestjs/sequelize";
import { IVideoRepository } from '@core/video/domain/video.repository';
import { CategoriesIdStorageValidator } from '@core/category/application/validators/categories-ids-exists-in-storage.validators';
import { GenresIdStorageValidator } from '@core/genre/application/validations/genres-id-storage-validator';
import { CastMembersIdStorageValidator } from '@core/cast-member/application/validators/cast-members-id-storage-validator';
import { CATEGORY_PROVIDERS } from '../categories-module/categories.provider';
import { CAST_MEMBERS_PROVIDERS } from '../cast-members-module/cast-members.provider';
import { ApplicationService } from '@core/shared/application/application.service';
import { IStorage } from '@core/shared/application/storage.interafce';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import {
  CreateVideoUseCase,
  GetVideoUseCase,
  ProcessMediasUseCase,
  UpdateVideoUseCase,
  UploadAudioVideoMediasUseCase
} from '@core/video/application/use-cases';
import { PublishVideoMediaReplacedQueueHandler } from '@core/video/application/handlers';
import { IMessageBroker } from '@core/shared/application/message-broker.interface';

export const REPOSITORIES = {
  VIDEO_REPOSITORY: {
    provide: 'VideoRepository',
    useExisting: VideoSequelizeRepository,
  },
  VIDEO_IN_MEMORY_REPOSITORY: {
    provide: VideoInMemoryRepository,
    useClass: VideoInMemoryRepository,
  },
  VIDEO_SEQUELIZE_REPOSITORY: {
    provide: VideoSequelizeRepository,
    useFactory: (videoModel: typeof VideoModel, uow: UnitOfWorkSequelize) => {
      return new VideoSequelizeRepository(videoModel, uow);
    },
    inject: [getModelToken(VideoModel), 'UnitOfWork'],
  },
};

export const USE_CASES = {
  CREATE_VIDEO_USE_CASE: {
    provide: CreateVideoUseCase,
    useFactory: (
      uow: IUnitOfWork,
      videoRepo: IVideoRepository,
      categoriesIdValidator: CategoriesIdStorageValidator,
      genresIdValidator: GenresIdStorageValidator,
      castMembersIdValidator: CastMembersIdStorageValidator,
    ) => {
      return new CreateVideoUseCase(
        uow,
        videoRepo,
        categoriesIdValidator,
        genresIdValidator,
        castMembersIdValidator,
      );
    },
    inject: [
      'UnitOfWork',
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_ID_STORAGE_VALIDATOR
        .provide,
      GENRES_PROVIDERS.VALIDATIONS.GENRES_IDS_EXISTS_IN_DATABASE_VALIDATOR
        .provide,
      CAST_MEMBERS_PROVIDERS.VALIDATIONS
        .CAST_MEMBERS_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide,
    ],
  },
  UPDATE_VIDEO_USE_CASE: {
    provide: UpdateVideoUseCase,
    useFactory: (
      uow: IUnitOfWork,
      videoRepo: IVideoRepository,
      categoriesIdValidator: CategoriesIdStorageValidator,
      genresIdValidator: GenresIdStorageValidator,
      castMembersIdValidator: CastMembersIdStorageValidator,
    ) => {
      return new UpdateVideoUseCase(
        uow,
        videoRepo,
        categoriesIdValidator,
        genresIdValidator,
        castMembersIdValidator,
      );
    },
    inject: [
      'UnitOfWork',
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_ID_STORAGE_VALIDATOR
        .provide,
      GENRES_PROVIDERS.VALIDATIONS.GENRES_IDS_EXISTS_IN_DATABASE_VALIDATOR
        .provide,
      CAST_MEMBERS_PROVIDERS.VALIDATIONS
        .CAST_MEMBERS_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide,
    ],
  },
  UPLOAD_AUDIO_VIDEO_MEDIA_USE_CASE: {
    provide: UploadAudioVideoMediasUseCase,
    useFactory: (
      appService: ApplicationService,
      videoRepo: IVideoRepository,
      storage: IStorage,
    ) => {
      return new UploadAudioVideoMediasUseCase(appService, videoRepo, storage);
    },
    inject: [
      ApplicationService,
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      'IStorage',
    ],
  },
  GET_VIDEO_USE_CASE: {
    provide: GetVideoUseCase,
    useFactory: (
      videoRepo: IVideoRepository,
      categoryRepo: ICategoryRepository,
      genreRepo: IGenreRepository,
      castMemberRepo: ICastMemberRepository,
    ) => {
      return new GetVideoUseCase(
        videoRepo,
        categoryRepo,
        genreRepo,
        castMemberRepo,
      );
    },
    inject: [
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
      CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    ],
  },
  PROCESS_AUDIO_VIDEO_MEDIA_USE_CASE: {
    provide: ProcessMediasUseCase,
    useFactory: (uow: IUnitOfWork, videoRepo: IVideoRepository) => {
      return new ProcessMediasUseCase(uow, videoRepo);
    },
    inject: ['UnitOfWork', REPOSITORIES.VIDEO_REPOSITORY.provide],
  },
};

export const HANDLERS = {
  PUBLISH_VIDEO_MEDIA_REPLACED_IN_QUEUE_HANDLER: {
    provide: PublishVideoMediaReplacedQueueHandler,
    useFactory: (messageBroker: IMessageBroker) => {
      return new PublishVideoMediaReplacedQueueHandler(messageBroker);
    },
    inject: ['IMessageBroker'],
  },
};

export const VIDEOS_PROVIDERS = {
  REPOSITORIES,
  USE_CASES,
  HANDLERS,
};