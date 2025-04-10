import { VideoModel } from './video.model';
import { SortDirection } from "../../../../shared/domain/repository/search-params";
import { IVideoRepository, VideoSearchParams, VideoSearchResult } from "../../../domain/video.repository";
import { UnitOfWorkSequelize } from '../../../../shared/infra/db/sequelize/unit-of-work-sequelize';
import { Video, VideoId } from '../../../domain/video.aggregate';
import { VideoModelMapper } from './video-model.mapper';
import { Nullable } from '@core/shared/domain/nullable';
import { literal, Op } from 'sequelize';
import { InvalidArgumentError } from '@core/shared/domain/errors/invalid-argument.error';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

export class VideoSequelizeRepository implements IVideoRepository {
  sortableFields: string[] = ['name', 'create_at'];
  orderBy = {
    name: (sort_dir: SortDirection) =>
      `binary ${this.videoModel.name}.name ${sort_dir}`
  }
  relations_include = [
    'categories_id',
    'genres_id',
    'cast_members_id',
    'image_medias',
    'audio_video_medias',
  ];
  private modelConfig;
  constructor(
    private videoModel: typeof VideoModel,
    private uow: UnitOfWorkSequelize,
  ) {
    this.modelConfig = {
      include: this.relations_include,
      transaction: this.uow.getTransaction(),
    }
  }

  async insert(entity: Video): Promise<void> {
    await this.videoModel.create(VideoModelMapper.toModel(entity), {
      ...this.modelConfig,
    });
  }

  async bulkInsert(entities: Video[]): Promise<void> {
    const models = entities.map((e) => VideoModelMapper.toModel(e));
    await this.videoModel.bulkCreate(models, { ...this.modelConfig });
  }

  async findById(entity_id: VideoId): Promise<Nullable<Video>> {
    const model = await this._get(entity_id.id);
    return model ? VideoModelMapper.toEntity(model) : null;
  }

  async findAll(): Promise<Video[]> {
    const models = await this.videoModel.findAll({ ...this.modelConfig });
    return VideoModelMapper.toCollectionEntity(models);
  }

  async findByIds(ids: VideoId[]): Promise<Video[]> {
    const models = await this.videoModel.findAll({
      where: {
        video_id: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
      ...this.modelConfig,
    });
    return VideoModelMapper.toCollectionEntity(models);
  }

  async existsById(ids: VideoId[]): Promise<{ exists: VideoId[]; not_exists: VideoId[]; }> {
    if (!ids.length)
      throw new InvalidArgumentError('ids must be an array with at least one element');

    const existsVideoModels = await this.videoModel.findAll({
      attributes: ['video_id'],
      where: {
        video_id: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
      transaction: this.uow.getTransaction(),
    });
    const exists = existsVideoModels.map((m) => new VideoId(m.video_id));
    const not_exists = ids.filter((id) => !exists.some((e) => e.equals(id)));
    return { exists, not_exists };
  }

  async update(entity: Video): Promise<void> {
    const model = await this._get(entity.video_id.id);

    if (!model)
      throw new NotFoundError(entity.video_id.id, this.getEntity());

    await Promise.all([
      ...model.image_medias.map((i) =>
        i.destroy({ transaction: this.uow.getTransaction() }),
      ),
      ...model.audio_video_medias.map((i) =>
        i.destroy({
          transaction: this.uow.getTransaction(),
        }),
      ),
      model.$remove(
        'categories',
        model.categories_id.map((c) => c.category_id),
        {
          transaction: this.uow.getTransaction(),
        },
      ),
      model.$remove(
        'genres',
        model.genres_id.map((c) => c.genre_id),
        {
          transaction: this.uow.getTransaction(),
        },
      ),
      model.$remove(
        'cast_members',
        model.cast_members_id.map((c) => c.cast_member_id),
        {
          transaction: this.uow.getTransaction(),
        },
      ),
    ]);

    const {
      categories_id,
      genres_id,
      cast_members_id,
      image_medias,
      audio_video_medias,
      ...props
    } = VideoModelMapper.toModel(entity);
    await this.videoModel.update(props, {
      where: { video_id: entity.video_id.id },
      transaction: this.uow.getTransaction(),
    });

    await Promise.all([
      ...image_medias.map((i) =>
        model.$create('image_media', i.toJSON(), {
          transaction: this.uow.getTransaction(),
        }),
      ),
      ...audio_video_medias.map((i) =>
        model.$create('audio_video_media', i.toJSON(), {
          transaction: this.uow.getTransaction(),
        }),
      ),
      model.$add(
        'categories',
        categories_id.map((c) => c.category_id),
        {
          transaction: this.uow.getTransaction(),
        },
      ),
      model.$add(
        'genres',
        genres_id.map((c) => c.genre_id),
        {
          transaction: this.uow.getTransaction(),
        },
      ),
      model.$add(
        'cast_members',
        cast_members_id.map((c) => c.cast_member_id),
        {
          transaction: this.uow.getTransaction(),
        },
      ),
    ]);

    this.uow.addAggregateRoot(entity);
  }

  async delete(id: VideoId): Promise<void> {
    //consultar o agregado
    const videoCategoryRelation =
      this.videoModel.associations.categories_id.target;
    const videoGenreRelation = this.videoModel.associations.genres_id.target;
    const videoCastMemberRelation =
      this.videoModel.associations.cast_members_id.target;
    const imageMediaModel = this.videoModel.associations.image_medias.target;
    const audioVideoMediaModel =
      this.videoModel.associations.audio_video_medias.target;

    await Promise.all([
      videoCategoryRelation.destroy({
        where: { video_id: id.id },
        transaction: this.uow.getTransaction(),
      }),
      videoGenreRelation.destroy({
        where: { video_id: id.id },
        transaction: this.uow.getTransaction(),
      }),
      videoCastMemberRelation.destroy({
        where: { video_id: id.id },
        transaction: this.uow.getTransaction(),
      }),
      imageMediaModel.destroy({
        where: { video_id: id.id },
        transaction: this.uow.getTransaction(),
      }),
      audioVideoMediaModel.destroy({
        where: { video_id: id.id },
        transaction: this.uow.getTransaction(),
      }),
    ]);
    const affectedRows = await this.videoModel.destroy({
      where: { video_id: id.id },
      transaction: this.uow.getTransaction(),
    });

    if (affectedRows !== 1)
      throw new NotFoundError(id.id, this.getEntity());
  }

  async search(props: VideoSearchParams): Promise<VideoSearchResult> {
    const { offset, limit } = props.calculateOffsetLimit();
    const videoTableName = this.videoModel.getTableName();
    const videoCategoryRelation =
      this.videoModel.associations.categories_id.target;
    const videoCategoryTableName = videoCategoryRelation.getTableName();
    const videoGenreRelation = this.videoModel.associations.genres_id.target;
    const videoGenreTableName = videoGenreRelation.getTableName();
    const videoCastMemberRelation =
      this.videoModel.associations.cast_members_id.target;
    const videoCastMemberTableName = videoCastMemberRelation.getTableName();
    const videoAlias = this.videoModel.name;

    const wheres: any[] = [];

    if (
      props.filter &&
      (props.filter.title ||
        props.filter.categories_id ||
        props.filter.genres_id ||
        props.filter.cast_members_id)
    ) {
      if (props.filter.title)
        wheres.push({
          field: 'title',
          value: `%${props.filter.title}%`,
          get condition() {
            return {
              [this.field]: {
                [Op.like]: this.value,
              },
            };
          },
          rawCondition: `${videoAlias}.title LIKE :title`,
        });

      if (props.filter.categories_id)
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
          rawCondition: `${videoCategoryTableName}.category_id IN (:categories_id)`,
        });

      if (props.filter.genres_id)
        wheres.push({
          field: 'genres_id',
          value: props.filter.genres_id.map((c) => c.id),
          get condition() {
            return {
              ['$genres_id.genre_id$']: {
                [Op.in]: this.value,
              },
            };
          },
          rawCondition: `${videoGenreTableName}.genre_id IN (:genres_id)`,
        });

      if (props.filter.cast_members_id)
        wheres.push({
          field: 'cast_members_id',
          value: props.filter.cast_members_id.map((c) => c.id),
          get condition() {
            return {
              ['$cast_members_id.cast_member_id$']: {
                [Op.in]: this.value,
              },
            };
          },
          rawCondition: `${videoCastMemberTableName}.cast_member_id IN (:cast_members_id)`,
        });
    }

    const orderBy =
      props.sort && this.sortableFields.includes(props.sort)
        ? this.formatSort(props.sort, props.sort_dir)
        : `${videoAlias}.\`created_at\` DESC`;

    const count = await this.videoModel.count({
      distinct: true,
      include: [
        props.filter?.categories_id && 'categories_id',
        props.filter?.genres_id && 'genres_id',
        props.filter?.cast_members_id && 'cast_members_id',
      ].filter((i) => i) as string[],
      where: wheres.length ? { [Op.and]: wheres.map((w) => w.condition) } : {},
      transaction: this.uow.getTransaction(),
    });

    const columnOrder = orderBy.replace('binary', '').trim().split(' ')[0];

    const query = [
      'SELECT',
      `DISTINCT ${videoAlias}.\`video_id\`,${columnOrder} FROM ${videoTableName} as ${videoAlias}`,
      props.filter?.categories_id
        ? `INNER JOIN ${videoCategoryTableName} ON ${videoAlias}.\`video_id\` = ${videoCategoryTableName}.\`category_id\``
        : '',
      props.filter?.genres_id
        ? `INNER JOIN ${videoGenreTableName} ON ${videoAlias}.\`video_id\` = ${videoGenreTableName}.\`genre_id\``
        : '',
      props.filter?.cast_members_id
        ? `INNER JOIN ${videoGenreTableName} ON ${videoAlias}.\`video_id\` = ${videoGenreTableName}.\`cast_member_id\``
        : '',
      wheres.length
        ? `WHERE ${wheres.map((w) => w.rawCondition).join(' AND ')}`
        : '',
      `ORDER BY ${orderBy}`,
      `LIMIT ${limit}`,
      `OFFSET ${offset}`,
    ];

    const [idsResult] = await this.videoModel.sequelize!.query(
      query.join(' '),
      {
        replacements: wheres.reduce(
          (acc, w) => ({ ...acc, [w.field]: w.value }),
          {},
        ),
        transaction: this.uow.getTransaction(),
      },
    );

    const models = await this.videoModel.findAll({
      where: {
        video_id: {
          [Op.in]: idsResult.map(
            (id: { video_id: string }) => id.video_id,
          ) as string[],
        },
      },
      include: this.relations_include,
      order: literal(orderBy),
      transaction: this.uow.getTransaction(),
    });

    return new VideoSearchResult({
      items: models.map((m) => VideoModelMapper.toEntity(m)),
      current_page: props.page,
      per_page: props.per_page,
      total: count,
    });
  }

  private formatSort(sort: string, sort_dir: Nullable<SortDirection>) {
    const dialect = this.videoModel.sequelize!.getDialect();
    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      return this.orderBy[dialect][sort](sort_dir);
    }
    return `${this.videoModel.name}.\`${sort}\` ${sort_dir}`;
  }

  getEntity(): new (...args: any[]) => Video {
    return Video;
  }

  private async _get(id: string): Promise<Nullable<VideoModel>> {
    return this.videoModel.findByPk(id, {
      ...this.modelConfig
    })
  }
}