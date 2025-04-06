import { Nullable } from "../../shared/domain/nullable";
import { CastMemberId } from "../../cast-member/domain/cast-member.aggregate";
import { CategoryId } from "../../category/domain/category.aggregate";
import { GenreId } from "../../genre/domain/genre.aggregate";
import { AggregateRoot } from "../../shared/domain/aggregate-root";
import { ValueObject } from "../../shared/domain/value-object";
import { Uuid } from "../../shared/domain/value-objects/uuid.vo";
import { Banner } from "./banner.vo";
import { Rating } from "./rating.vo";
import { Thumbnail } from "./thumbnail.vo";
import { Trailer } from "./trailer.vo";
import { VideoMedia } from "./video-media.vo";
import { ThumbnailHalf } from "./thumbnail-half.vo";
import { VideoValidatorFactory } from "./video.validator";
import { AudioVideoMediaStatus } from "../../shared/domain/value-objects/audio-video-media.vo";

export type VideoConsctructorProps = {
  video_id?: VideoId;
  title: string;
  description: string;
  year_launched: number;
  duration: number;
  rating: Rating;
  is_opened: boolean;
  is_published: boolean;

  banner?: Banner;
  thumbnail?: Thumbnail;
  thumbnail_half?: ThumbnailHalf;
  trailer?: Trailer;
  video?: VideoMedia;

  categories_id: Map<string, CategoryId>;
  genres_id: Map<string, GenreId>;
  cast_members_id: Map<string, CastMemberId>;
  created_at?: Date;
}

export type VideoCreateCommand = {
  title: string;
  description: string;
  year_launched: number;
  duration: number;
  rating: Rating;
  is_opened: boolean;
  is_published?: boolean;

  banner?: Banner;
  thumbnail?: Thumbnail;
  thumbnail_half?: ThumbnailHalf;
  trailer?: Trailer;
  video?: VideoMedia;

  categories_id: CategoryId[];
  genres_id: GenreId[];
  cast_members_id: CastMemberId[];
}

export class VideoId extends Uuid { }

export class Video extends AggregateRoot {
  video_id: VideoId;
  title: string;
  description: string;
  year_launched: number;
  duration: number;
  rating: Rating;
  is_opened: boolean;
  is_published: boolean;

  banner: Nullable<Banner>;
  thumbnail: Nullable<Thumbnail>;
  thumbnail_half: Nullable<ThumbnailHalf>;
  trailer: Nullable<Trailer>;
  video: Nullable<VideoMedia>;

  // Relations 
  categories_id: Map<string, CategoryId>;
  genres_id: Map<string, GenreId>;
  cast_members_id: Map<string, CastMemberId>;

  created_at: Date;

  constructor(props: VideoConsctructorProps) {
    super();
    this.video_id = props.video_id ?? new VideoId();
    this.title = props.title;
    this.description = props.description;
    this.year_launched = props.year_launched;
    this.duration = props.duration;
    this.rating = props.rating;
    this.is_opened = props.is_opened;
    this.is_published = props.is_published;

    this.banner = props.banner ?? null;
    this.thumbnail = props.thumbnail ?? null;
    this.thumbnail_half = props.thumbnail_half ?? null;
    this.trailer = props.trailer ?? null;
    this.video = props.video ?? null;

    this.categories_id = props.categories_id;
    this.genres_id = props.genres_id;
    this.cast_members_id = props.cast_members_id;
    this.created_at = props.created_at ?? new Date();

    this.validate();
    this.markAsPublished();
  }

  static create(props: VideoCreateCommand): Video {
    const video = new Video({
      ...props,
      categories_id: new Map(props.categories_id.map((category) => [category.id, category])),
      genres_id: new Map(props.genres_id.map((genre) => [genre.id, genre])),
      cast_members_id: new Map(props.cast_members_id.map((castMember) => [castMember.id, castMember])),
      is_published: false
    });
    video.validate();
    video.markAsPublished();
    return video;
  }

  changeTitle(title: string) {
    this.title = title;
    this.validate(['title']);
  }

  changeDescription(description: string) {
    this.description = description;
  }

  changeYearLaunched(year: number) {
    this.year_launched = year;
  }

  changeDuration(duration: number) {
    this.duration = duration;
  }

  changeRating(rating: Rating) {
    this.rating = rating;
  }

  markAsOpened() {
    this.is_opened = true;
  }

  markAsClosed() {
    this.is_opened = false;
  }

  markAsUnpublished() {
    this.is_published = false;
  }

  replaceBanner(banner: Banner) {
    this.banner = banner;
  }

  replaceThumbnail(thumbnail: Thumbnail) {
    this.thumbnail = thumbnail;
  }

  replaceThumbnailHalf(thumbnail_half: ThumbnailHalf) {
    this.thumbnail_half = thumbnail_half;
  }

  replaceTrailer(trailer: Trailer) {
    this.trailer = trailer;
    this.markAsPublished();
  }

  replaceVideo(video: VideoMedia) {
    this.video = video;
    this.markAsPublished();
  }

  private markAsPublished() {
    if (
      this.trailer &&
      this.video &&
      this.trailer.status === AudioVideoMediaStatus.COMPLETED &&
      this.video.status === AudioVideoMediaStatus.COMPLETED
    ) {
      this.is_published = true;
    }
  }

  addCategoryId(category_id: CategoryId) {
    this.categories_id.set(category_id.id, category_id);
  }

  removeCategoryId(category_id: CategoryId) {
    this.categories_id.delete(category_id.id);
  }

  syncCategoriesId(categories_id: CategoryId[]) {
    if (!categories_id.length) {
      throw new Error('Categories id cannot be empty');
    }
    this.categories_id = new Map(categories_id.map((category) => [category.id, category]));
  }

  addGenreId(genre_id: GenreId) {
    this.genres_id.set(genre_id.id, genre_id);
  }

  removeGenreId(genre_id: GenreId) {
    this.genres_id.delete(genre_id.id);
  }

  syncGenresId(genres_id: GenreId[]) {
    if (!genres_id.length) {
      throw new Error('Genres id cannot be empty');
    }
    this.genres_id = new Map(genres_id.map((genre) => [genre.id, genre]));
  }

  addCastMemberId(cast_member_id: CastMemberId) {
    this.cast_members_id.set(cast_member_id.id, cast_member_id);
  }

  removeCastMemberId(cast_member_id: CastMemberId) {
    this.cast_members_id.delete(cast_member_id.id);
  }

  syncCastMembersId(cast_members_id: CastMemberId[]) {
    if (!cast_members_id.length) {
      throw new Error('Cast members id cannot be empty');
    }
    this.cast_members_id = new Map(cast_members_id.map((castMember) => [castMember.id, castMember]));
  }

  validate(fields?: string[]) {
    const validator = VideoValidatorFactory.create();
    return validator.validate(this.notification, this, fields);
  }

  get entity_id(): ValueObject {
    return this.video_id;
  }

  toJSON() {
    return {
      video_id: this.video_id,
      title: this.title,
      description: this.description,
      year_launched: this.year_launched,
      duration: this.duration,
      rating: this.rating,
      is_opened: this.is_opened,
      is_published: this.is_published,
      banner: this.banner ? this.banner.toJSON() : null,
      thumnail: this.thumbnail ? this.thumbnail.toJSON() : null,
      thumbnail_half: this.thumbnail_half ? this.thumbnail_half.toJSON() : null,
      trailer: this.trailer ? this.trailer.toJSON() : null,
      video: this.video ? this.video.toJSON() : null,
      categories_id: Array.from(this.categories_id.values())
        .map((category) => category.id),
      genres_id: Array.from(this.genres_id.values())
        .map((genre) => genre.id),
      cast_members_id: Array.from(this.cast_members_id.values())
        .map((castMember) => castMember.id),
      created_at: this.created_at
    };
  }
}