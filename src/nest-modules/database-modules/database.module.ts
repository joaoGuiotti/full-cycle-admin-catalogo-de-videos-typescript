import { CategoryModel } from '../../core/category/infra/db/sequelize/category.model';
import { CastMemberModel } from '../../core/cast-member/infra/db/sequelize/cast-member.model';
import { Global, Module, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, SequelizeModule } from '@nestjs/sequelize';
import { CONFIG_SCHEMA_TYPE } from 'src/nest-modules/config-modules/config.module';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { Sequelize } from 'sequelize';

const models = [
  CategoryModel,
  CastMemberModel
];

@Global()
@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: (config: ConfigService<CONFIG_SCHEMA_TYPE>) => {
        const dbVendor = config.get('DB_VENDOR')
        if (dbVendor === 'sqlite') {
          return {
            dialect: 'sqlite',
            host: config.get('DB_HOST'),
            models,
            logging: config.get('DB_LOGGING'),
            autoLoadModels: config.get('DB_AUTO_LOAD_MODELS')
          }
        }

        if (dbVendor === 'mysql') {
          return {
            dialect: 'mysql',
            host: config.get('DB_HOST'),
            port: config.get('DB_PORT'),
            database: config.get('DB_DATABASE'),
            username: config.get('DB_USERNAME'),
            password: config.get('DB_PASSWORD'),
            models,
            logging: config.get('DB_LOGGING'),
            autoLoadModels: config.get('DB_AUTO_LOAD_MODELS')
          }
        }
        throw new Error(`Unsupported database configuration: ${dbVendor}`);
      },
      inject: [ConfigService]
    }),
  ],
  providers: [
    {
      provide: UnitOfWorkSequelize,
      useFactory: (sequelize: Sequelize) => {
        return new UnitOfWorkSequelize(sequelize);
      },
      inject: [getConnectionToken()],
      scope: Scope.REQUEST,
    },
    {
      provide: 'UnitOfWork',
      useExisting: UnitOfWorkSequelize,
      scope: Scope.REQUEST

    },
  ],
  exports: ['UnitOfWork']
})
export class DatabaseModule { }
