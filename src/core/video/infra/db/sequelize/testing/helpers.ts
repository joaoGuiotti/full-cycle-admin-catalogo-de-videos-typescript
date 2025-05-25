import { SequelizeOptions } from 'sequelize-typescript';
import { ImageMediaModel } from '../image-media.model';
import {
  VideoCastMemberModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoModel,
} from '../video.model';
import { AudioVideoMediaModel } from '../audio-video-media.model';
import { CategoryModel } from '../../../../../category/infra/db/sequelize/category.model';
import {
  GenreCategoryModel,
  GenreModel,
} from '../../../../../genre/infra/db/sequelize/genre-model';
import { CastMemberModel } from '../../../../../cast-member/infra/db/sequelize/cast-member.model';
import { setupSequelize } from '../../../../../shared/infra/helpers/helpers';

export function setupSequelizeForVideo(options: SequelizeOptions = {}) {
  return setupSequelize({
    models: [
      ImageMediaModel,
      VideoModel,
      AudioVideoMediaModel,
      VideoCategoryModel,
      CategoryModel,
      VideoGenreModel,
      GenreModel,
      GenreCategoryModel,
      VideoCastMemberModel,
      CastMemberModel,
    ],
    ...options,
  });
}