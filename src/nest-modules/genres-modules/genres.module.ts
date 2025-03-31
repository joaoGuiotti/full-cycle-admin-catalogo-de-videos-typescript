import { GenreCategoryModel, GenreModel } from '@core/genre/infra/db/sequelize/genre-model';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { GenresController } from './genres.controller';
import { CategoriesModule } from '../categories-modules/categories.module';
import { GENRE_PROVIDERS } from './genres.provider';

@Module({
  imports: [
    SequelizeModule.forFeature([GenreModel, GenreCategoryModel]),
    CategoriesModule,
  ],
  controllers: [GenresController],
  providers: [
    ...Object.values(GENRE_PROVIDERS.REPOSITORIES),
    ...Object.values(GENRE_PROVIDERS.USE_CASES),
    ...Object.values(GENRE_PROVIDERS.VALIDATIONS)
  ],
  exports: [
    GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
    GENRE_PROVIDERS.VALIDATIONS.GENRES_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide
  ]
})
export class GenresModule { }
