import { Module } from '@nestjs/common';
import { CategoriesModule } from './nest-modules/categories-modules/categories.module';
import { DatabaseModule } from './nest-modules/database-modules/database.module';
import { ConfigModule } from './nest-modules/config-modules/config.module';
import { SharedModule } from './nest-modules/shared-module/shared.module';
import { CastMembersModule } from './nest-modules/cast-members-modules/cast-members.module';
import { GenresModule } from './nest-modules/genres-modules/genres.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    CategoriesModule,
    CastMembersModule,
    GenresModule,
    SharedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
