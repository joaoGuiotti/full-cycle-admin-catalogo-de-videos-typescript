import { CastMember, CastMemberId } from "@core/cast-member/domain/cast-member.aggregate";
import { ICastMemberRepository } from "@core/cast-member/domain/cast-member.repository";
import { SortDirection } from "@core/shared/domain/repository/search-params";
import { InMemorySearchableRepository } from "@core/shared/infra/db/in-memory/in-memory.repository";

export class CastMemberInMemoryRepository
  extends InMemorySearchableRepository<CastMember, CastMemberId>
  implements ICastMemberRepository {

  sortableFields: string[] = ['name', 'created_at'];

  protected async applyFilter(items: CastMember[], filter: string | null): Promise<CastMember[]> {
    if (!filter) return items;
    return items.filter((i) => {
      return (
        i.name.toLowerCase().includes(filter.toLowerCase())
      )
    });
  }

  getEntity(): new (...args: any[]) => CastMember {
    return CastMember;
  }

  protected applySort(
    items: CastMember[],
    sort: string | null,
    sort_dir: SortDirection | null
  ): CastMember[] {
    return !!sort
      ? super.applySort(items, sort, sort_dir)
      : super.applySort(items, 'created_at', 'desc');
  }

}