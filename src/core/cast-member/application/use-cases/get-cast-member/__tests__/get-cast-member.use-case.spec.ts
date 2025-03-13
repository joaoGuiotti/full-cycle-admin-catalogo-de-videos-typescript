import { CastMemberInMemoryRepository } from "@core/cast-member/infra/db/im-memory/cast-member-in-memory.repository";
import { NotFoundError } from "../../../../../shared/domain/errors/not-found.error";
import { InvalidUuidError, Uuid } from "../../../../../shared/domain/value-objects/uuid.vo";
import { GetCastMemberUseCase } from "../get-cast-member.use-case";
import { CastMember, CastMemberTypes } from "@core/cast-member/domain/cast-member.aggregate";

describe('GetCastMemberUseCase Unit Tests', () => {
  let repo: CastMemberInMemoryRepository;
  let useCase: GetCastMemberUseCase;

  beforeEach(() => {
    repo = new CastMemberInMemoryRepository();
    useCase = new GetCastMemberUseCase(repo);
  });

  it('Should throws error when entity not found', async () => {
    await expect(() => useCase.execute({ id: 'fake id' }))
      .rejects.toThrow(new InvalidUuidError());

    const uuid = new Uuid();
    await expect(() => useCase.execute({ id: uuid.id }))
      .rejects.toThrow(new NotFoundError(uuid.id, CastMember));
  });

  it('should return a category', async () => {
    const items = [CastMember.create({ name: 'Movie', type: CastMemberTypes.ACTOR })];
    repo.items = items;
    const spyFindId = jest.spyOn(repo, 'findById');
    const output = await useCase.execute({ id: items[0].cast_member_id.id });
    expect(spyFindId).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: items[0].cast_member_id.id,
      name: 'Movie',
      type: 2,
      created_at: items[0].created_at
    });
  })
})