import { SearchParams, SearchParamsConstructorProps } from "../../shared/domain/repository/search-params";
import { CategoryId } from "../../category/domain/category.aggregate";
import { Nullable } from "../../shared/domain/nullable";
import { SearchResult } from "../../shared/domain/repository/search-result";
import { Genre, GenreId } from "./genre.aggregate";
import { ISearchableRepository } from "../../shared/domain/repository/repository-interface";

export type GenreFilter = {
  name?: string;
  categories_id?: CategoryId[]
}

export type GenreSearchParamsCreateCommand = Omit<SearchParamsConstructorProps<GenreFilter>, 'filter'> & {
  filter?: {
    name?: string;
    categories_id?: CategoryId[] | string[];
  }
};

export class GenreSearchParams extends SearchParams<GenreFilter> {

  private constructor(props: SearchParamsConstructorProps<GenreFilter> = {}) {
    super(props);
  }

  static create(props: GenreSearchParamsCreateCommand = {}) {
    const categories_id = props.filter?.categories_id
      ?.map((c) => c instanceof CategoryId ? c : new CategoryId(c));
    return new GenreSearchParams({
      ...props,
      filter: {
        name: props.filter?.name,
        categories_id
      }
    })
  }

  get filter(): Nullable<GenreFilter> {
    return this._filter;
  }

  protected set filter(value: Nullable<GenreFilter>) {
    const _value = !value || (value as unknown) === '' || typeof value !== 'object'
      ? null : value;

    const filter = {
      ...(_value?.name && { name: `${_value.name}` }),
      ...(_value?.categories_id && _value?.categories_id.length > 0 && {
        categories_id: _value.categories_id
      })
    };

    this._filter = Object.keys(filter).length === 0
      ? null : filter;
  }
}

export class GenreSearchResult extends SearchResult<Genre> { }

export interface IGenreRepository
  extends ISearchableRepository<
    Genre,
    GenreId,
    GenreFilter,
    GenreSearchParams,
    GenreSearchResult
  > { }