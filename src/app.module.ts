import { Module } from '@nestjs/common';
import { CategoriesModule } from './nest-modules/categories-modules/categories.module';
import { DatabaseModule } from './nest-modules/database-modules/database.module';
import { ConfigModule } from './nest-modules/config-modules/config.module';
import { SharedModule } from './nest-modules/shared-module/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    CategoriesModule,
    SharedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
