import { IUseCase } from "../../../../shared/application/use-case.interface";
import { GenreOutput, GenreOutputMapper } from "../common/genre-output";
import { GenreSearchParams, GenreSearchResult, IGenreRepository } from "../../../../genre/domain/genre.repository";
import { ICategoryRepository } from "../../../../category/domain/category.repository";
import { PaginationOutput, PaginationOutputMapper } from "../../../../shared/application/pagination-output";
import { ListGenreInput } from "./list-genre.inputs";
import { CategoryId } from "../../../../category/domain/category.aggregate";

export type ListGenreOutput = PaginationOutput<GenreOutput>;

export class ListGenreUseCase
  implements IUseCase<ListGenreInput, ListGenreOutput> {

  constructor(
    private genreRepo: IGenreRepository,
    private categoryRepo: ICategoryRepository,
  ) {}

  async execute(input: ListGenreInput): Promise<ListGenreOutput> {
    const params = GenreSearchParams.create(input);
    const searchResult = await this.genreRepo.search(params);
    return this.toOutput(searchResult);
  }

  private async toOutput(searchResult: GenreSearchResult): Promise<ListGenreOutput> {
    const { items: _items } = searchResult;
    const categoriesIdRelated = searchResult.items.reduce<CategoryId[]>(
      (acc, item) => {
        return acc.concat([...item.categories_id.values()]);
      },
      [],
    );
    const categoriesRelated = await this.categoryRepo.findByIds(categoriesIdRelated);
    
    const items = _items.map((i) => {
      const categoriesOfGenre = categoriesRelated.filter((c) =>
        i.categories_id.has(c.category_id.id),
      );
      return GenreOutputMapper.toOutput(i, categoriesOfGenre);
    });

    return PaginationOutputMapper.toOutput(items, searchResult);
  }
}