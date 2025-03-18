import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";
import { CastMemberSearchResult } from "@core/cast-member/domain/cast-member.repository";
import { CastMemberInMemoryRepository } from "@core/cast-member/infra/db/im-memory/cast-member-in-memory.repository";
import { CastMemberOutputMapper } from "../../common/cast-member-output";
import { ListCastMembersUseCase } from "../list-cast-members.use-case";
import { CastMemberType, CastMemberTypes } from "@core/cast-member/domain/cast-member-type.vo";

describe('ListCastMemberUseCase Unitary Test', () => {
  let useCase: ListCastMembersUseCase;
  let repo: CastMemberInMemoryRepository;

  beforeEach(() => {
    repo = new CastMemberInMemoryRepository();
    useCase = new ListCastMembersUseCase(repo);
  });

  test('toOutput method', () => {
    let result = new CastMemberSearchResult({
      items: [],
      total: 1,
      current_page: 1,
      per_page: 2,
      last_page: 1
    });
    let output = useCase['toOutput'](result);
    expect(output).toStrictEqual({
      items: [],
      total: 1,
      current_page: 1,
      per_page: 2,
      last_page: 1
    });

    const entity = CastMember.create({ name: 'Movie', type: CastMemberType.createADirector() });
    result = new CastMemberSearchResult({
      items: [entity],
      total: 1,
      current_page: 1,
      per_page: 2,
      last_page: 1
    });

    output = useCase['toOutput'](result);
    expect(output).toStrictEqual({
      items: [entity].map(CastMemberOutputMapper.toOutput),
      total: 1,
      current_page: 1,
      per_page: 2,
      last_page: 1
    });
  });

  it('shold return output sorted by created_at when input param is empty', async () => {
    const items = [
      CastMember.create({ name: 'test1', type: CastMemberType.createAnActor() }),
      CastMember.create({ name: 'test2', type: CastMemberType.createAnActor() }),
    ];
    repo.items = items;
    const output = await useCase.execute({});
    expect(output).toStrictEqual({
      items: [...items].reverse().map(CastMemberOutputMapper.toOutput),
      total: 2,
      current_page: 1,
      per_page: 15,
      last_page: 1
    });
  });

});