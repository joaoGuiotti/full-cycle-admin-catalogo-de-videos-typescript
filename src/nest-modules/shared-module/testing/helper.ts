import { UnitOfWorkSequelize } from "../../../core/shared/infra/db/sequelize/unit-of-work-sequelize";
import { INestApplication } from "@nestjs/common";
import { getConnectionToken } from "@nestjs/sequelize";
import { Test, TestingModule } from "@nestjs/testing";
import { Sequelize } from "sequelize-typescript";
import { AppModule } from "src/app.module";
import { applyGlobalConfigApp } from "src/nest-modules/global.config";
import 'src/nest-modules/shared-module/testing/supertest-extend';

export interface StartHelper {
  app: INestApplication;
}

export function startApp(): StartHelper {
  let _app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).overrideProvider('UnitOfWork')
      .useFactory({
        factory: (sequelize: Sequelize) => new UnitOfWorkSequelize(sequelize),
        inject: [getConnectionToken()],
      })
      .compile();

    const sequelize = moduleFixture.get<Sequelize>(getConnectionToken());
    await sequelize.sync({ force: true });

    _app = moduleFixture.createNestApplication();
    applyGlobalConfigApp(_app);
    await _app.init();
  });

  afterEach(async () => {
    await _app?.close();
  });

  // utilziar essa tecnica de retornar uma isntancia de uma variavel usando app
  // garante que consigamos usar em outro contexto de teste o app que é aplicação nest
  return {
    get app() {
      return _app;
    }
  }
}