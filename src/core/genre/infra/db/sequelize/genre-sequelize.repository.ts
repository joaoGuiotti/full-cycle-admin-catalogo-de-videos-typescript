import { Transform } from 'class-transformer';
import { UnitOfWorkSequelize } from './../../../../shared/infra/db/sequelize/unit-of-work-sequelize';
import { Nullable } from './../../../../shared/domain/nullable';
import { SortDirection } from "../../../../shared/domain/repository/search-params";
import { GenreSearchParams, GenreSearchResult, IGenreRepository } from "../../../../genre/domain/genre.repository";
import { GenreModel } from "./genre-model";
import { Genre, GenreId } from "../../../../genre/domain/genre.aggregate";
import { GenreModelMapper } from "./genre-model.mapper";
import { FindOptions, literal, Op } from 'sequelize';
import { InvalidArgumentError } from '../../../../shared/domain/errors/invalid-argument.error';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error';
import { throws } from 'assert';

const INCLUDE_CATEGORIES_ID: FindOptions = {
  include: ['categories_id'],
}

export class GenreSequelizeRepository implements IGenreRepository {
  sortableFields: string[] = ['name', 'created_at'];
  orderBy = {
    mysql: {
      name: (sort_dir: SortDirection) =>
        `binary ${this.genreModel.name}.name ${sort_dir}`,
    },
  };

  constructor(
    private genreModel: typeof GenreModel,
    private uow: UnitOfWorkSequelize
  ) { }

  async insert(entity: Genre): Promise<void> {
    await this.genreModel.create(GenreModelMapper.toModel(entity), {
      ...INCLUDE_CATEGORIES_ID,
      transaction: this.uow.getTransaction(),
    });
  }

  async bulkInsert(entities: Genre[]): Promise<void> {
    const models = entities.map((e) => GenreModelMapper.toModel(e));
    await this.genreModel.bulkCreate(models, {
      ...INCLUDE_CATEGORIES_ID,
      transaction: this.uow.getTransaction(),
    });
  }

  async findById(entity_id: GenreId): Promise<Nullable<Genre>> {
    const model = await this._get(entity_id.id);
    return model ? GenreModelMapper.toEntity(model) : null;
  }

  async findByIds(ids: GenreId[]): Promise<Genre[]> {
    const models = await this.genreModel.findAll({
      where: {
        genre_id: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
      ...INCLUDE_CATEGORIES_ID,
      transaction: this.uow.getTransaction(),
    });
    return models.map((m) => GenreModelMapper.toEntity(m));
  }

  async findAll(): Promise<Genre[]> {
    const models = await this.genreModel.findAll({
      ...INCLUDE_CATEGORIES_ID,
      transaction: this.uow.getTransaction(),
    });
    return models.map((m) => GenreModelMapper.toEntity(m))
  }

  async existsById(ids: GenreId[]): Promise<{ exists: GenreId[]; not_exists: GenreId[] }> {
    if (!ids.length)
      throw new InvalidArgumentError(
        'ids must be an array at least one element',
      );

    const existsGenreModels = await this.genreModel.findAll({
      attributes: ['genre_id'],
      where: {
        genre_id: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
      transaction: this.uow.getTransaction(),
    });

    const existsGenreIds = existsGenreModels.map((m) => new GenreId(m.genre_id));
    const notExistsGenreIds = ids.filter((id) => !existsGenreIds.some((e) => e.equals(id)));

    return {
      exists: existsGenreIds,
      not_exists: notExistsGenreIds,
    }
  }

  async update(entity: Genre): Promise<void> {
    const genreId = entity.genre_id.id
    const model = await this._get(genreId);
    if (!model)
      throw new NotFoundError(genreId, this.getEntity());
    await model.$remove(
      'categories',
      model.categories_id.map((c) => c.category_id),
      {
        transaction: this.uow.getTransaction(),
      }
    );
    const { categories_id, ...props } =
      GenreModelMapper.toModel(entity);
    await this.genreModel.update(props, {
      where: { genre_id: genreId },
      transaction: this.uow.getTransaction(),
    });
    await model.$add(
      'categories',
      categories_id.map((c) => c.category_id),
      {
        transaction: this.uow.getTransaction(),
      }
    );
  }

  async delete(id: GenreId): Promise<void> {
    const genreCategoryRelation =
      this.genreModel.associations.categories_id.target;
    await genreCategoryRelation.destroy({
      where: { genre_id: id.id },
      transaction: this.uow.getTransaction(),
    });
    const affectedRows = await this.genreModel.destroy({
      where: { genre_id: id.id },
      transaction: this.uow.getTransaction(),
    });

    if (affectedRows !== 1) {
      throw new NotFoundError(id.id, this.getEntity());
    }
  }

  async search(props: GenreSearchParams): Promise<GenreSearchResult> {
    const { offset, limit } = props.calculateOffsetLimit();
    const genreCategoryRelation = this.genreModel.associations.categories_id.target;
    const genreTableName = this.genreModel.getTableName();
    const genreCategoryTableName = genreCategoryRelation.getTableName();
    const genreAlias = this.genreModel.name;
    const wheres: any[] = [];

    if (props.filter && (props.filter.name || props.filter.categories_id)) {
      if (props.filter.name) {
        wheres.push({
          field: 'name',
          value: `%${props.filter.name}%`,
          get condition() {
            return {
              [this.field]: {
                [Op.like]: this.value,
              },
            };
          },
          rawCondition: `${genreAlias}.name LIKE :name`,
        });
      }

      if (props.filter.categories_id) {
        wheres.push({
          field: 'categories_id',
          value: props.filter.categories_id.map((c) => c.id),
          get condition() {
            return {
              ['$categories_id.category_id$']: {
                [Op.in]: this.value,
              },
            };
          },
          rawCondition: `${genreCategoryTableName}.category_id IN (:categories_id)`,
        });
      }
    }

    const orderBy = props.sort && this.sortableFields.includes(props.sort)
      ? this.formatSort(props.sort, props.sort_dir!) : `${genreAlias}.\`created_at\` DESC`;

    // @ts-expect-error - count is a number
    const count: number = await this.genreModel.count({
      distinct: true,
      // @ts-expect-error - add include only if categories_id is defined
      include: [props.filter?.categories_id && 'categories_id'].filter(
        (i) => i,
      ),
      where: wheres.length ? { [Op.and]: wheres.map((w) => w.condition) } : {},
    });

    const columnOrder = orderBy.replace('binary', '').trim().split(' ')[0];

    const query = [
      'SELECT',
      `DISTINCT ${genreAlias}.\`genre_id\`,${columnOrder} FROM ${genreTableName} as ${genreAlias}`,
      props.filter?.categories_id
        ? `INNER JOIN ${genreCategoryTableName} ON ${genreAlias}.\`genre_id\` = ${genreCategoryTableName}.\`genre_id\``
        : '',
      wheres.length
        ? `WHERE ${wheres.map((w) => w.rawCondition).join(' AND ')}`
        : '',
      `ORDER BY ${orderBy}`,
      `LIMIT ${limit}`,
      `OFFSET ${offset}`,
    ];

    const [idsResult] = await this.genreModel.sequelize!.query(
      query.join(' '),
      {
        replacements: wheres.reduce(
          (acc, w) => ({ ...acc, [w.field]: w.value }),
          {},
        ),
        transaction: this.uow.getTransaction(),
      }
    );

    const models = await this.genreModel.findAll({
      where: {
        genre_id: {
          [Op.in]: idsResult.map(
            (id: { genre_id: string }) => id.genre_id,
          ) as string[],
        },
      },
      include: ['categories_id'],
      order: literal(orderBy),
      transaction: this.uow.getTransaction(),
    }); 

    return new GenreSearchResult({
      items: models.map((m) => GenreModelMapper.toEntity(m)),
      current_page: props.page,
      per_page: props.per_page,
      total: count,
    });
  }

  private async _get(id: string): Promise<GenreModel | null> {
    return this.genreModel.findByPk(id, {
      ...INCLUDE_CATEGORIES_ID,
      transaction: this.uow.getTransaction(),
    });
  }

  private formatSort(sort: string, sort_dir: SortDirection) {
    const dialect = this.genreModel.sequelize!.getDialect();
    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      return this.orderBy[dialect][sort](sort_dir);
    }
    return `${this.genreModel.name}.\`${sort}\` ${sort_dir}`;
  }

  getEntity(): new (...args: any[]) => Genre {
    return Genre;
  }
}