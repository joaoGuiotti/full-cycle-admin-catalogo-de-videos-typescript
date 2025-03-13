import { CastMemberInMemoryRepository } from "@core/cast-member/infra/db/im-memory/cast-member-in-memory.repository";
import { NotFoundError } from "../../../../../shared/domain/errors/not-found.error";
import { InvalidUuidError, Uuid } from "../../../../../shared/domain/value-objects/uuid.vo";
import { DeleteCastMemberUseCase } from "../delete-cast-member.use-case";
import { CastMember, CastMemberTypes } from "@core/cast-member/domain/cast-member.aggregate";

describe('DeleteCastMemberUseCase Unit Tests', () => {
  let useCase: DeleteCastMemberUseCase;
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new DeleteCastMemberUseCase(repository);
  });

  it('should throws error when entity not found', async () => {
    await expect(() => useCase.execute({ id: 'fake id' })).rejects.toThrow(
      new InvalidUuidError(),
    );

    const castMemberId = new Uuid();

    await expect(() => useCase.execute({ id: castMemberId.id })).rejects.toThrow(
      new NotFoundError(castMemberId.id, CastMember),
    );
  });

  it('should delete a category', async () => {
    const items = [new CastMember({ name: 'test 1', type: CastMemberTypes.ACTOR })];
    repository.items = items;
    await useCase.execute({
      id: items[0].cast_member_id.id,
    });
    expect(repository.items).toHaveLength(0);
  });
});