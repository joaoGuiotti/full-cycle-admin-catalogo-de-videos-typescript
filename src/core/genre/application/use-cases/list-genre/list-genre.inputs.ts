import { Type } from 'class-transformer';
import { SearchInput } from '../../../../shared/application/search-input';
import { SortDirection } from '../../../../shared/domain/repository/search-params';
import {
  IsArray, 
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
  validateSync,
} from 'class-validator';

export class ListGenresFilter {
  @IsOptional()
  @IsString()
  name?: string;
  @IsUUID('4', { each: true })
  @IsArray()
  categories_id?: string[];
}

export class ListGenresInput implements SearchInput<ListGenresFilter> {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  per_page?: number;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  sort_dir?: SortDirection;

  @ValidateNested()
  @Type(() => ListGenresFilter)
  @IsOptional()
  filter?: ListGenresFilter;
}

export class ValidateListGenresInput {
  static validate(input: ListGenresInput) {
    return validateSync(input);
  }
}
