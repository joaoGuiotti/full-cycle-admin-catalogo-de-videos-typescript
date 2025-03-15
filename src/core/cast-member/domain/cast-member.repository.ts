import { SearchParams, SearchParamsConstructorProps } from "@core/shared/domain/repository/search-params";
import { SearchResult } from "@core/shared/domain/repository/search-result";
import { CastMember, CastMemberId } from "./cast-member.aggregate";
import { ISearchableRepository } from "@core/shared/domain/repository/repository-interface";
import { CastMemberTypes, InvalidCastMemberTypeError } from "./cast-member-type.vo";
import { Either } from "@core/shared/domain/either";
import { SearchValidationError } from "@core/shared/domain/validators/validation.error";

export type CastMemberFilter = {
  name?: string;
  type?: CastMemberTypes;
};

export class CastMemberSearchParams extends SearchParams<CastMemberFilter> {
  private constructor(
    props: SearchParamsConstructorProps<CastMemberFilter> = {},
  ) {
    super(props);
  }

  static create(
    props: Omit<SearchParamsConstructorProps<CastMemberFilter>, 'filter'> & {
      filter?: {
        name?: string | null;
        type?: CastMemberTypes | null;
      };
    } = {},
  ) {
    return new CastMemberSearchParams({
      ...props,
      filter: {
        name: props.filter?.name!,
        type: props.filter?.type!,
      },
    });
  }

  get filter(): CastMemberFilter | null {
    return this._filter;
  }

  protected set filter(value: CastMemberFilter | null) {
    const _value =
      !value || (value as unknown) === '' || typeof value !== 'object'
        ? null
        : value;

    const filter = {
      ...(_value && _value.name && { name: `${_value?.name}` }),
      ...(_value && _value.type && { type: _value.type }),
    };

    this._filter = Object.keys(filter).length === 0 ? null : filter;
  }
}

export class CastMemberSearchResult extends SearchResult<CastMember> { };

export interface ICastMemberRepository
  extends ISearchableRepository<
    CastMember,
    CastMemberId,
    CastMemberFilter,
    CastMemberSearchParams,
    CastMemberSearchResult
  > { }