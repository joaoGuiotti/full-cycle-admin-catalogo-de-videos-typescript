import { NotFoundError } from "../../../../../shared/domain/errors/not-found.error";
import { Uuid } from "../../../../../shared/domain/value-objects/uuid.vo";
import { setupSequelize } from "../../../../../shared/infra/helpers/helpers";
import { Category } from "../../../../domain/category.aggregate";
import { CategorySequelizeRepository } from "../../../../infra/db/sequelize/category-sequelize.repository";
import { CategoryModel } from "../../../../infra/db/sequelize/category.model";
import { DeleteCategoryUseCase } from "../delete-category.use-case";

describe('DeleteCategoryUseCase Integration Test', () => {
  let useCase: DeleteCategoryUseCase;
  let repo: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repo = new CategorySequelizeRepository(CategoryModel);
    useCase = new DeleteCategoryUseCase(repo);
  });

  it('Should throws error when entity not found', async () => {
    const uuid = new Uuid();
    await expect(() => useCase.execute({ id: uuid.id }))
      .rejects.toThrow(new NotFoundError(uuid.id, Category));
  });

  it('Should delete a category', async () => {
    const category = Category.fake().aCategory().build();
    await repo.insert(category);
    await useCase.execute({ id: category.category_id.id });
    await expect(repo.findById(category.category_id))
      .resolves.toBeNull();
  });
});