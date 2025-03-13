import { CastMemberInMemoryRepository } from "@core/cast-member/infra/db/im-memory/cast-member-in-memory.repository";
import { NotFoundError } from "../../../../../shared/domain/errors/not-found.error";
import { InvalidUuidError, Uuid } from "../../../../../shared/domain/value-objects/uuid.vo";
import { UpdateCastMemberUseCase } from "../update-cast-member.use-case";
import { CastMember, CastMemberTypes } from "@core/cast-member/domain/cast-member.aggregate";

describe('UpdateCastMemberUseCase Unit Test', () => {
  let useCase!: UpdateCastMemberUseCase;
  let repository!: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new UpdateCastMemberUseCase(repository);
  });

  it('Should throws error when entiity not found', async () => {
    await expect(() =>
      useCase.execute({ id: 'fake id', name: 'Fake', type: CastMemberTypes.ACTOR })
    ).rejects.toThrow(new InvalidUuidError());

    const uuid = new Uuid();

    await expect(() =>
      useCase.execute({ id: uuid.id, name: 'fake',  type: CastMemberTypes.DIRECTOR })
    ).rejects.toThrow(new NotFoundError(uuid.id, CastMember));
  });
  it('Should throws error when entiity not found', async () => {
    const spyUpdate = jest.spyOn(repository, 'update');
    const entity = new CastMember({ name: 'test', type: CastMemberTypes.ACTOR });

    repository.items = [entity];

    let output = await useCase.execute({
      id: entity.cast_member_id.id,
      name: 'test',
      type: 2
    });

    expect(spyUpdate).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: entity.cast_member_id.id,
      name: 'test',
      type: 2,
      created_at: entity.created_at
    });

    type Arrange = {
      input: {
        id: string;
        name: string;
        type: CastMemberTypes,
        is_active?: boolean;
      };
      expected: {
        id: string;
        name: string;
        type: CastMemberTypes,
        created_at: Date;
      };
    };

    const arrange: Arrange[] = [
      {
        input: {
          id: entity.cast_member_id.id,
          name: 'test',
          type: CastMemberTypes.DIRECTOR,
        },
        expected: {
          id: entity.cast_member_id.id,
          name: 'test',
          type: CastMemberTypes.DIRECTOR,
          created_at: entity.created_at,
        },
      },
      {
        input: {
          id: entity.cast_member_id.id,
          name: 'test',
          type: CastMemberTypes.ACTOR,
        },
        expected: {
          id: entity.cast_member_id.id,
          name: 'test',
          type: CastMemberTypes.ACTOR,
          created_at: entity.created_at,
        },
      },
      {
        input: {
          id: entity.cast_member_id.id,
          name: 'test',
          is_active: false,
          type: CastMemberTypes.ACTOR,
        },
        expected: {
          id: entity.cast_member_id.id,
          name: 'test',
          type: CastMemberTypes.ACTOR,
          created_at: entity.created_at,
        },
      },
      {
        input: {
          id: entity.cast_member_id.id,
          name: 'test',
          type: CastMemberTypes.DIRECTOR,
        },
        expected: {
          id: entity.cast_member_id.id,
          name: 'test',
          type: CastMemberTypes.DIRECTOR,
          created_at: entity.created_at,
        },
      },
      {
        input: {
          id: entity.cast_member_id.id,
          name: 'test',
          type: CastMemberTypes.ACTOR,
        },
        expected: {
          id: entity.cast_member_id.id,
          name: 'test',
          type: CastMemberTypes.ACTOR,
          created_at: entity.created_at,
        },
      },
      {
        input: {
          id: entity.cast_member_id.id,
          name: 'test',
          type: CastMemberTypes.ACTOR,
        },
        expected: {
          id: entity.cast_member_id.id,
          name: 'test',
          type: CastMemberTypes.ACTOR,
          created_at: entity.created_at,
        },
      },
    ];

    for (const i of arrange) {
      output = await useCase.execute({
        id: i.input.id,
        name: i.input.name,
        type: i.input.type
      });
      expect(output).toStrictEqual({
        id: entity.cast_member_id.id,
        name: i.expected.name,
        type: i.expected.type,
        created_at: i.expected.created_at,
      });
    }

  });
});