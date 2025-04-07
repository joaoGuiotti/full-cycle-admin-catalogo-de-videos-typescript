import { Nullable } from "../../../../shared/domain/nullable";
import { SortDirection } from "../../../../shared/domain/repository/search-params";
import { InMemorySearchableRepository } from "../../../../shared/infra/db/in-memory/in-memory.repository";
import { Video, VideoId } from "../../../../video/domain/video.aggregate";
import { IVideoRepository, VideoFilter } from "../../../../video/domain/video.repository";

export class VideoInMemoryRepository
  extends InMemorySearchableRepository<Video, VideoId, VideoFilter>
  implements IVideoRepository {

  sortableFields: string[] = ['title', 'created_at'];

  protected async applyFilter(items: Video[], filter: Nullable<VideoFilter>): Promise<Video[]> {
    if (!filter) {
      return items;
    }

    return items.filter((i) => {
      const containsTitle = filter.title && i.title.toLocaleLowerCase()
        .includes(filter.title.toLocaleLowerCase());
      const containsCategoriesId = filter.categories_id && filter.categories_id
        .some((id) => i.categories_id.has(id.id));
      const containsGenresId = filter.genres_id && filter.genres_id
        .some((id) => i.genres_id.has(id.id));
      const containsCastMembersId = filter.cast_members_id && filter.cast_members_id
        .some((id) => i.cast_members_id.has(id.id));

      const filterMap = [
        [filter.title, containsTitle],
        [filter.categories_id, containsCategoriesId],
        [filter.genres_id, containsGenresId],
        [filter.cast_members_id, containsCastMembersId],
      ].filter((i) => i[0]);

      return filterMap.every((i) => i[1]);
    });
  }

  protected applySort(
    items: Video[],
    sort: Nullable<string>,
    sort_dir: Nullable<SortDirection>,
  ): Video[] {

    return !sort
      ? super.applySort(items, 'created_at', 'desc')
      : super.applySort(items, sort, sort_dir);
  }

  getEntity(): new (...args: any[]) => Video {
    return Video;
  }

}