import { CastMemberSequelizeRepository } from "@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository";
import { Uuid } from "../../../../../shared/domain/value-objects/uuid.vo";
import { setupSequelize } from "../../../../../shared/infra/helpers/helpers";
import { CreateCastMemberUseCase } from "../../create-cast-member/create-cast-member.use-case";
import { CastMemberModel } from "@core/cast-member/infra/db/sequelize/cast-member.model";
import { CastMemberTypes } from "@core/cast-member/domain/cast-member.aggregate";

describe('CreateCastMemberUseCase Integration Test', () => {
  let useCase!: CreateCastMemberUseCase;
  let repository!: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new CreateCastMemberUseCase(repository);
  });

  it('Should create a category', async () => {
    let output = await useCase.execute({ name: 'test', type: CastMemberTypes.ACTOR });
    let entity = await repository.findById(new Uuid(output.id));
    expect(output).toStrictEqual({
      id: entity?.cast_member_id.id,
      name: 'test',
      type: 2,
      created_at: entity?.created_at,
    });

    output = await useCase.execute({ name: 'test', type: CastMemberTypes.DIRECTOR });
    entity = await repository.findById(new Uuid(output.id));
    expect(output).toStrictEqual({
      id: entity?.cast_member_id.id,
      name: 'test',
      type: 1,
      created_at: entity?.created_at,
    });

  });

});
