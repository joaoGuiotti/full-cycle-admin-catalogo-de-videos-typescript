# Criando e Executando Migrations com TypeScript

Este guia explica como criar e executar migrations utilizando o comando `npm run migrate:ts` em um projeto configurado com Sequelize e TypeScript.

## Criando uma Migration

Para criar uma nova migration, utilize o seguinte comando:

```bash
npm run migrate:ts create -- --name create-videos-table.ts --folder ./src/core/video/infra/db/sequelize/migrations/
```

### Explicação do Comando
- `npm run migrate:ts`: Script configurado no `package.json` para gerenciar migrations.
- `create`: Indica que você deseja criar uma nova migration.
- `--name create-videos-table.ts`: Define o nome do arquivo da migration. Escolha um nome descritivo para indicar a funcionalidade ou alteração.
- `--folder ./src/core/video/infra/db/sequelize/migrations/`: Especifica o diretório onde a migration será criada.

## Estrutura de uma Migration

Cada migration contém dois métodos principais:
- `up`: Define as alterações a serem aplicadas ao banco de dados.
- `down`: Define como reverter as alterações aplicadas.

Exemplo de uma migration em TypeScript:

```typescript
import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable('Videos', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });
  },
  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('Videos');
  },
};
```

## Executando Migrations

### Aplicar Migrations
Para aplicar todas as migrations pendentes ao banco de dados, utilize:
```bash
npm run migrate:ts up
```

### Reverter Migrations
Para desfazer a última migration aplicada, execute:
```bash
npm run migrate:ts down
```

### Explicação dos Comandos
- `up`: Aplica as alterações definidas no método `up` de cada migration.
- `down`: Reverte as alterações aplicadas, executando o método `down` da última migration.

## Boas Práticas
- Sempre teste suas migrations em um ambiente de desenvolvimento antes de aplicá-las em produção.
- Use nomes descritivos para facilitar a identificação do propósito de cada migration.
- Mantenha o controle de versão do código atualizado para evitar conflitos.

Para mais informações, consulte a [documentação oficial do Sequelize](https://sequelize.org/docs/v6/).