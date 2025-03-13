import { CastMemberSequelizeRepository } from "@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository";
import { NotFoundError } from "../../../../../shared/domain/errors/not-found.error";
import { Uuid } from "../../../../../shared/domain/value-objects/uuid.vo";
import { setupSequelize } from "../../../../../shared/infra/helpers/helpers";
import { DeleteCastMemberUseCase } from "../delete-cast-member.use-case";
import { CastMemberModel } from "@core/cast-member/infra/db/sequelize/cast-member.model";
import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";

describe('DeleteCastMemberUseCase Integration Test', () => {
  let useCase: DeleteCastMemberUseCase;
  let repo: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repo = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new DeleteCastMemberUseCase(repo);
  });

  it('Should throws error when entity not found', async () => {
    const uuid = new Uuid();
    await expect(() => useCase.execute({ id: uuid.id }))
      .rejects.toThrow(new NotFoundError(uuid.id, CastMember));
  });

  it('Should delete a category', async () => {
    const category = CastMember.fake().anActor().build();
    await repo.insert(category);
    await useCase.execute({ id: category.cast_member_id.id });
    await expect(repo.findById(category.cast_member_id))
      .resolves.toBeNull();
  });
});