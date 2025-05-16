import { Module } from '@nestjs/common';
import { CategoriesModule } from './nest-modules/categories-module/categories.module';
import { DatabaseModule } from './nest-modules/database-module/database.module';
import { ConfigModule } from './nest-modules/config-module/config.module';
import { SharedModule } from './nest-modules/shared-module/shared.module';
import { CastMembersModule } from './nest-modules/cast-members-module/cast-members.module';
import { GenresModule } from './nest-modules/genres-module/genres.module';
import { VideosModule } from './nest-modules/videos-module/videos.module';
import { EventModule } from './nest-modules/event-module/event.module';
import { UseCaseModule } from './nest-modules/use-case-module/use-case.module';
import { RabbitMQFakeConsumer } from './rabbitmq-fake/rabbitmq-fake.consumer';
import { RabbitMQFakeController } from './rabbitmq-fake/rabbitmq-fake.controller';
import { RabbitmqModule } from './nest-modules/rabbitmq-module/rabbitmq.module';
import { AuthModule } from './nest-modules/auth-module/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SharedModule,
    DatabaseModule,
    EventModule,
    UseCaseModule,
    RabbitmqModule.forRoot(),
    AuthModule,
    CategoriesModule,
    CastMembersModule,
    GenresModule,
    VideosModule,
  ],
  controllers: [RabbitMQFakeController],
  providers: [RabbitMQFakeConsumer],
})
export class AppModule { }
