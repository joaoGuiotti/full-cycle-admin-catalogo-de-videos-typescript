import { CastMember, CastMemberId } from "@core/cast-member/domain/cast-member.aggregate";
import { CastMemberSearchParams, CastMemberSearchResult, ICastMemberRepository } from "@core/cast-member/domain/cast-member.repository";
import { Injectable } from "@nestjs/common";
import { CastMemberModel } from "./cast-member.model";
import { CastMemberModelMapper } from "./cast-member-mapper";
import { NotFoundError } from "@core/shared/domain/errors/not-found.error";
import { SortDirection } from "@core/shared/domain/repository/search-params";
import { literal, Op } from "sequelize";

@Injectable()
export class CastMemberSequelizeRepository implements ICastMemberRepository {
  sortableFields: string[] = ['name', 'created_at'];
  orderBy = {
    mysql: {
      name: (sort_dir: SortDirection) => literal(`binary name ${sort_dir}`), //ascii
    },
  };

  constructor(private castMemberModel: typeof CastMemberModel) { }

  async search(props: CastMemberSearchParams): Promise<CastMemberSearchResult> {
    const offset = (props.page - 1) * props.per_page;
    const limit = props.per_page;
    const { rows, count } = await this.castMemberModel.findAndCountAll({
      ...(props.filter && {
        where: {
          name: { [Op.like]: `%${props.filter}%` },
        },
      }),
      ...(props.sort && this.sortableFields.includes(props.sort)
        ? { order: this.formatSort(props.sort, props.sort_dir!) }
        : { order: [['created_at', 'desc']] }
      ),
      offset,
      limit
    });
    return new CastMemberSearchResult({
      items: rows.map((row) => CastMemberModelMapper.toEntity(row)),
      current_page: props.page,
      per_page: props.per_page,
      total: count,
    });
  }

  private formatSort(sort: string, sort_dir: SortDirection) {
    const dialect = this.castMemberModel.sequelize!.getDialect() as 'mysql';
    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      return this.orderBy[dialect][sort](sort_dir);
    }
    return [[sort, sort_dir]];
  }

  async insert(entity: CastMember): Promise<void> {
    const modelProps = CastMemberModelMapper.toModel(entity);
    await this.castMemberModel.create(modelProps.toJSON());
  }

  async bulkInsert(entities: CastMember[]): Promise<void> {
    const modelProps = entities.map((entity) =>
      CastMemberModelMapper.toModel(entity).toJSON()
    );
    await this.castMemberModel.bulkCreate(modelProps);
  }

  async update(entity: CastMember): Promise<void> {
    const id = entity.cast_member_id.id;

    const modelProps = CastMemberModelMapper.toModel(entity);
    const [affectedRows] = await this.castMemberModel.update(
      modelProps.toJSON(),
      {
        where: { cast_member_id: entity.cast_member_id.id },
      },
    );

    if (affectedRows !== 1) {
      throw new NotFoundError(id, this.getEntity());
    }
  }

  async delete(entity_id: CastMemberId): Promise<void> {
    const id = entity_id.id;
    const affectedRows = await this.castMemberModel.destroy({
      where: { cast_member_id: id }
    });
    if (affectedRows !== 1)
      throw new NotFoundError(id, this.getEntity());
  }

  async findById(entity_id: CastMemberId): Promise<CastMember | null> {
    const model = await this.castMemberModel.findByPk(entity_id.id);
    return model ? CastMemberModelMapper.toEntity(model) : null;
  }

  async findAll(): Promise<CastMember[]> {
    const models = await this.castMemberModel.findAll();
    return models.map((model) =>
      CastMemberModelMapper.toEntity(model)
    );
  }

  getEntity(): new (...args: any[]) => CastMember {
    return CastMember;
  }

}