import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { SortDirection } from '@core/shared/domain/repository/search-params';

// export class SearchGenreDto extends ListGenresInput {}

export class ListGenresFilter {
  @IsOptional()
  @IsString()
  name?: string;

  @IsUUID('4', { each: true })
  @IsArray()
  @IsOptional()
  categories_id?: string[];
}

export class SearchGenreDto {
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
  //   @Transform(({ value }) => JSON.parse(value))
  filter?: ListGenresFilter;
}
