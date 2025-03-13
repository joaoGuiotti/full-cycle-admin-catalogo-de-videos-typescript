import { CastMemberFilter, CastMemberSearchParams, CastMemberSearchResult, ICastMemberRepository } from "@core/cast-member/domain/cast-member.repository";
import { IUseCase } from "@core/shared/application/use-case.interface";
import { CastMemberOutput, CastMemberOutputMapper } from "../common/cast-member-output";
import { PaginationOutput, PaginationOutputMapper } from "@core/shared/application/pagination-output";
import { SearchParamsConstructorProps } from "@core/shared/domain/repository/search-params";

export class ListCastMembersUseCase
  implements IUseCase<ListCastMembersInput, ListCastMembersOutput> {

  constructor(private repo: ICastMemberRepository) { }

  async execute(input: ListCastMembersInput): Promise<ListCastMembersOutput> {
    const params = new CastMemberSearchParams(input);
    const searchResult = await this.repo.search(params);
    return this.toOutput(searchResult);
  }

  private toOutput(searchResult: CastMemberSearchResult): ListCastMembersOutput {
    const { items: _items } = searchResult;
    const items = _items.map((i) => {
      return CastMemberOutputMapper.toOutput(i);
    });
    return PaginationOutputMapper.toOutput(items, searchResult);
  }
}

export type ListCastMembersInput = SearchParamsConstructorProps<CastMemberFilter>;
export type ListCastMembersOutput = PaginationOutput<CastMemberOutput>;
