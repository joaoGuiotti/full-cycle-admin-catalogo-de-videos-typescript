import { CastMemberInMemoryRepository } from "@core/cast-member/infra/db/im-memory/cast-member-in-memory.repository";
import { CreateCastMemberUseCase } from "../create-cast-member.use-case";
import { CastMemberTypes } from "@core/cast-member/domain/cast-member.aggregate";

describe('CreateCastMemberUseCase Unit Test', () => {
  let useCase!: CreateCastMemberUseCase;
  let repository!: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new CreateCastMemberUseCase(repository);
  });
  
  it('should throw an error when aggregate is not valid', async () => {
    const input = { name: 't'.repeat(256), type: CastMemberTypes.DIRECTOR };
    await expect(() => useCase.execute(input)).rejects.toThrowError(
      'Entity Validation Error',
    );
  });

  it('Should create a category', async () => {
    const spyInsert = jest.spyOn(repository, 'insert');
    let output = await useCase.execute({ name: 'test', type: CastMemberTypes.DIRECTOR });
    expect(spyInsert).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: repository.items[0].cast_member_id.id,
      name: 'test',
      type: 1,
      created_at: repository.items[0].created_at,
    });

    output = await useCase.execute({
      name: 'test',
      type: 1,
    });

    expect(output).toStrictEqual({
      id: repository.items[1].cast_member_id.id,
      name: 'test',
      type: 1,
      created_at: repository.items[1].created_at,
    });
  });


});