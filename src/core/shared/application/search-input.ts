import { Nullable } from '@core/shared/domain/nullable';
import { SortDirection } from "../domain/repository/search-params";

export type SearchInput<Filter = string> = {
  page?: number;
  per_page?: number;
  sort?: Nullable<string>;
  sort_dir?: Nullable<SortDirection>;
  filter?: Nullable<Filter>;
};