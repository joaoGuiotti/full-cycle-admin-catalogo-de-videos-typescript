import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { VideoCastMemberModel, VideoCategoryModel, VideoGenreModel, VideoModel } from '../../core/video/infra/db/sequelize/video.model';
import { ImageMediaModel } from '../../core/video/infra/db/sequelize/image-media.model';
import { AudioVideoMediaModel } from '../../core/video/infra/db/sequelize/audio-video-media.model';
import { CategoriesModule } from '../categories-modules/categories.module';
import { GenresModule } from '../genres-modules/genres.module';
import { CastMembersModule } from '../cast-members-modules/cast-members.module';
import { VIDEOS_PROVIDERS } from './videos.providers';
import { VideoUploadService } from './services/upload.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      VideoModel,
      VideoCategoryModel,
      VideoGenreModel,
      VideoCastMemberModel,
      ImageMediaModel,
      AudioVideoMediaModel,
    ]),
    CategoriesModule,
    GenresModule,
    CastMembersModule,
  ],
  controllers: [VideosController],
  providers: [
    ...Object.values(VIDEOS_PROVIDERS.REPOSITORIES),
    ...Object.values(VIDEOS_PROVIDERS.USE_CASES),
    VideoUploadService,
  ],
})
export class VideosModule {}
