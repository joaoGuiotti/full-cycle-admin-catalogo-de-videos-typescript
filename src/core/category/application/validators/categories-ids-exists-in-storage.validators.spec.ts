import { CategoryInMemoryRepository } from "../../../category/infra/db/in-memory/category-in-memory.repository";
import { CategoriesIdStorageValidator } from "./categories-ids-exists-in-storage.validators";
import { Category, CategoryId } from "../../../category/domain/category.aggregate";
import { NotFoundError } from "../../../shared/domain/errors/not-found.error";

describe('CategoriesIdsValidators Unit Tests', () => {
  let categoryRepo: CategoryInMemoryRepository;
  let validator: CategoriesIdStorageValidator;

  beforeEach(() => {
    categoryRepo = new CategoryInMemoryRepository();
    validator = new CategoriesIdStorageValidator(categoryRepo);
  });

  it('should return many not found error when categories id is not exists in repository', async () => {
    const categoriesIds = [CategoryId.create(), CategoryId.create()];
    const spyExistsById = jest.spyOn(categoryRepo, 'existsById');
    let [categoriesId, errorsCategoriesId] = await validator.validate(categoriesIds.map((c) => c.id));
    expect(categoriesId).toStrictEqual(null);
    expect(errorsCategoriesId).toStrictEqual(
      categoriesIds.map((c) => new NotFoundError(c.id, Category)),
    );
    expect(spyExistsById).toHaveBeenCalledTimes(1);

    const category1 = Category.fake().aCategory().build();
    const category2 = categoriesIds[1];
    await categoryRepo.insert(category1);

    [categoriesId, errorsCategoriesId] = await validator.validate([
      category1.category_id.id,
      category2.id
    ]);
    expect(categoriesId).toStrictEqual(null);
    expect(errorsCategoriesId).toStrictEqual([
      new NotFoundError(category2.id, Category)
    ]);
    expect(spyExistsById).toHaveReturnedTimes(2);
  });

  it('should return a list of categories id', async () => {
    const category1 = Category.fake().aCategory().build();
    const category2 = Category.fake().aCategory().build();
    await categoryRepo.bulkInsert([category1, category2]);
    const [categoriesId, errorsCategoriesId] = await validator.validate([
      category1.category_id.id,
      category2.category_id.id,
    ]);
    expect(categoriesId).toHaveLength(2);
    expect(errorsCategoriesId).toStrictEqual(null);
    expect(categoriesId[0]).toBeValueObject(category1.category_id);
    expect(categoriesId[1]).toBeValueObject(category2.category_id);
  });

});

