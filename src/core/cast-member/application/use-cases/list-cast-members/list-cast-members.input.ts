import { CastMemberTypes } from '../../../../cast-member/domain/cast-member-type.vo';
import { SearchInput } from '../../../../shared/application/search-input';
import { SortDirection } from '../../../../shared/domain/repository/search-params';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
  validateSync,
} from 'class-validator';

export class ListCastMembersFilter {
  @IsOptional()
  @IsString()
  name?: string | null;

  @IsInt()
  @IsOptional()
  type?: CastMemberTypes | null;
}

export class ListCastMembersInput
  implements SearchInput<ListCastMembersFilter>
{
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
  @Type(() => ListCastMembersFilter)
  filter?: ListCastMembersFilter;
}

export class ValidateListCastMembersInput {
  static validate(input: ListCastMembersInput) {
    return validateSync(input);
  }
}
