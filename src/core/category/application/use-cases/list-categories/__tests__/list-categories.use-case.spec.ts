import { Category } from "../../../../domain/category.aggregate";
import { CategorySearchResult } from "../../../../domain/category.repository";
import { CategoryInMemoryRepository } from "../../../../infra/db/in-memory/category-in-memory.repository";
import { CategoryOutputMapper } from "../../common/category-output";
import { ListCategoriesUseCase } from "../list-categories.use-case";

describe('ListCategoryUseCase Unitary Test', () => {
  let useCase: ListCategoriesUseCase;
  let repo: CategoryInMemoryRepository;

  beforeEach(() => {
    repo = new CategoryInMemoryRepository();
    useCase = new ListCategoriesUseCase(repo);
  });

  test('toOutput method', () => {
    let result = new CategorySearchResult({
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

    const entity = Category.create({ name: 'Movie' });
    result = new CategorySearchResult({
      items: [entity],
      total: 1,
      current_page: 1,
      per_page: 2,
      last_page: 1
    });

    output = useCase['toOutput'](result);
    expect(output).toStrictEqual({
      items: [entity].map(CategoryOutputMapper.toOutput),
      total: 1,
      current_page: 1,
      per_page: 2,
      last_page: 1
    });
  });

  it('shold return output sorted by created_at when input param is empty', async () => {
    const items = [
      new Category({ name: 'test1' }),
      new Category({
        name: 'test2',
        created_at: new Date(new Date().getTime() + 100)
      })
    ];
    repo.items = items;
    const output = await useCase.execute({});
    expect(output).toStrictEqual({
      items: [...items].reverse().map(CategoryOutputMapper.toOutput),
      total: 2,
      current_page: 1,
      per_page: 15,
      last_page: 1
    });
  });

});