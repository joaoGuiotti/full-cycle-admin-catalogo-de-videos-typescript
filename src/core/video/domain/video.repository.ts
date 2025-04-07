import { GenreId } from './../../genre/domain/genre.aggregate';
import { CategoryId } from './../../category/domain/category.aggregate';
import { CastMemberId } from '../../cast-member/domain/cast-member.aggregate';
import { SearchParams, SearchParamsConstructorProps } from '../../shared/domain/repository/search-params';
import { Nullable } from '../../shared/domain/nullable';
import { SearchResult } from '../../shared/domain/repository/search-result';
import { Video, VideoId } from './video.aggregate';
import { ISearchableRepository } from '../../shared/domain/repository/repository-interface';

export type VideoFilter = {
  title?: string;
  categories_id?: CategoryId[];
  genres_id?: GenreId[];
  cast_members_id?: CastMemberId[];
};

export type VideoSearchParamsCreateCommand = Omit<SearchParamsConstructorProps<VideoFilter>, 'filter'> & {
  filter?: {
    title?: string;
    categories_id?: CategoryId[] | string[];
    genres_id?: GenreId[] | string[];
    cast_members_id?: CastMemberId[] | string[];
  }
}

export class VideoSearchParams extends SearchParams<VideoFilter> {
  private constructor(props: SearchParamsConstructorProps<VideoFilter> = {}) {
    super(props);
  }

  static create(props: VideoSearchParamsCreateCommand = {}) {
    const categories_id = props.filter?.categories_id?.map((id) =>
      id instanceof CategoryId ? id : new CategoryId(id),
    );
    const genres_id = props.filter?.genres_id?.map((id) =>
      id instanceof GenreId ? id : new GenreId(id)
    );
    const cast_members_id = props.filter?.cast_members_id?.map((id) =>
      id instanceof CastMemberId ? id : new CastMemberId(id)
    );

    return new VideoSearchParams({
      ...props,
      filter: {
        ...props.filter,
        categories_id,
        genres_id,
        cast_members_id
      }
    });
  }

  get filter(): Nullable<VideoFilter> {
    return this._filter;
  }

  protected set filter(value: Nullable<VideoFilter>) {
    const _value = !value || (value as unknown) === '' || typeof value !== 'object'
      ? null : value;
    const filter = {
      ...(_value?.title && { title: `${_value?.title}` }),
      ...(_value?.categories_id && _value.categories_id.length
        && { categories_id: _value.cast_members_id, }),
      ...(_value?.genres_id && _value.genres_id.length
        && { genres_id: _value.cast_members_id, }),
      ...(_value?.cast_members_id && _value.cast_members_id.length
        && { cast_members_id: _value.cast_members_id, }),
    };
    this._filter = Object.keys(filter).length === 0 ? null : filter;
  }
}

export class VideoSearchResult extends SearchResult<Video> { }

export interface IVideoRepository
  extends ISearchableRepository<
    Video,
    VideoId,
    VideoFilter,
    VideoSearchParams,
    VideoSearchResult
  > { }