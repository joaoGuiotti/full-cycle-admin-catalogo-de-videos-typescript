
import { ListCategoriesInput } from '@core/category/application/use-cases';
import { SortDirection } from '@core/shared/domain/repository/search-params';

export class SearchCategoriesDto implements ListCategoriesInput {
  page?: number;
  per_page?: number;
  sort?: string | null;
  sort_dir?: SortDirection | null;
  filter?: string;
}
