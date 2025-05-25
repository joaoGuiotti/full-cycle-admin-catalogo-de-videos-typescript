import { join } from "path";
import { Sequelize } from "sequelize"
import { SequelizeStorage, Umzug, UmzugOptions } from "umzug";

export function migrator(
  sequelize: Sequelize,
  options?: Partial<UmzugOptions>
) {
  return new Umzug({
    migrations: {
      glob: [
        '*/infra/db/sequelize/migrations/*.{js,ts}',
        {
          cwd: join(__dirname, '..', '..', '..', '..'),
          ignore: [
            '**/*.d.ts',
            '**/index.ts',
            '**/index.js']
        }
      ]
    },
    context: sequelize,
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
    ...(options ?? {})
  });
}

/**
  ORM - Validação de sincronização de schema do banco

  rodo as migrações 
  validar a sincronização --- ok

 *  Teste de validação Schema(mysql que é o banco de dados de produção)
 * 
 * - gerar o schema do banco via models
 * - gerar o schema so banco via mudança
 * - gero um dump do schema1 e schema2
 * 
 */




