import { CastMemberSequelizeRepository } from "@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository";
import { setupSequelize } from "../../../../../shared/infra/helpers/helpers";
import { ListCastMembersUseCase } from "../list-cast-members.use-case";
import { CastMemberModel } from "@core/cast-member/infra/db/sequelize/cast-member.model";
import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";
import { CastMemberOutputMapper } from "../../common/cast-member-output";

describe('ListCastMemberUseCase Integration Test', () => {
  let useCase: ListCastMembersUseCase;
  let repo: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repo = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new ListCastMembersUseCase(repo);
  });

  it('Should return output sorted by created_at when input param is empty', async () => {
    const castMembers = CastMember.fake()
      .theCastMembers(2)
      .withCreatedAt((i) => new Date(new Date().getTime() + 1000 + i))
      .build();

    await repo.bulkInsert(castMembers);
    const output = await useCase.execute({});
    expect(output).toEqual({
      items: [...castMembers].reverse().map(CastMemberOutputMapper.toOutput),
      total: 2,
      current_page: 1,
      per_page: 15,
      last_page: 1
    });
  });

  it('Should return output using pagination, sort and filter', async () => {
    const castMembers = [
      CastMember.fake().anActor().withName('a').build(),
      CastMember.fake().anActor().withName('AAA').build(),
      CastMember.fake().anActor().withName('AaA').build(),
      CastMember.fake().anActor().withName('b').build(),
      CastMember.fake().anActor().withName('c').build()
    ];
    await repo.bulkInsert(castMembers);
    let output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: 'name',
      filter: { name: 'a' }
    });

    expect(output).toEqual({
      items: [castMembers[1], castMembers[2]].map(CastMemberOutputMapper.toOutput),
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2
    });

    // sorting
    output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: 'name',
      sort_dir: 'desc',
      filter: { name: 'a' }
    });

    expect(output).toEqual({
      items: [castMembers[0], castMembers[2]].map(CastMemberOutputMapper.toOutput),
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2
    });
  });

});