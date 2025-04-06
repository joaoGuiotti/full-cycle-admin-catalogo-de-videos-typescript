import { IDomainEvent } from "../../../shared/domain/events/domain-event.interafce";
import { Video, VideoCreateCommand, VideoId } from "../video.aggregate";
import { Rating } from "../rating.vo";
import { Banner } from "../banner.vo";
import { ThumbnailHalf } from "../thumbnail-half.vo";
import { Thumbnail } from "../thumbnail.vo";
import { Trailer } from "../trailer.vo";
import { VideoMedia } from "../video-media.vo";
import { CategoryId } from "../../../category/domain/category.aggregate";
import { GenreId } from "../../../genre/domain/genre.aggregate";
import { CastMemberId } from "../../../cast-member/domain/cast-member.aggregate";
import { Nullable } from "../../../shared/domain/nullable";

export type VideoCreatedEventProps = VideoCreateCommand & {
  video_id: VideoId;
  is_published: boolean,
  banner: Nullable<Banner>,
  thumbnail: Nullable<Thumbnail>,
  thumbnail_half: Nullable<ThumbnailHalf>,
  trailer: Nullable<Trailer>,
  video: Nullable<VideoMedia>,
  created_at: Date,
}

export class VideoCreatedEvent implements IDomainEvent {
  readonly aggregate_id: VideoId;
  readonly occurred_on: Date;
  readonly event_version: number;

  readonly title: string;
  readonly description: string;
  readonly year_launched: number;
  readonly duration: number;
  readonly rating: Rating;
  readonly is_opened: boolean;
  readonly is_published: boolean;
  readonly banner: Nullable<Banner>;
  readonly thumbnail: Nullable<Thumbnail>;
  readonly thumbnail_half: Nullable<ThumbnailHalf>;
  readonly trailer: Nullable<Trailer>;
  readonly video: Nullable<VideoMedia>;
  readonly categories_id: CategoryId[];
  readonly genres_id: GenreId[];
  readonly cast_members_id: CastMemberId[];
  readonly created_at: Date;

  constructor(props: VideoCreatedEventProps) {
    this.aggregate_id = props.video_id;
    this.title = props.title;
    this.description = props.description;
    this.year_launched = props.year_launched;
    this.duration = props.duration;
    this.rating = props.rating;
    this.is_opened = props.is_opened;
    this.is_published = props.is_published;
    this.banner = props.banner;
    this.thumbnail = props.thumbnail;
    this.thumbnail_half = props.thumbnail_half;
    this.trailer = props.trailer;
    this.video = props.video;
    this.categories_id = props.categories_id;
    this.genres_id = props.genres_id;
    this.cast_members_id = props.cast_members_id;
    this.created_at = props.created_at;
    this.occurred_on = new Date();
    this.event_version = 1;
  }

  static create(video: Video) {
    return new VideoCreatedEvent({
      video_id: video.video_id,
      title: video.title,
      description: video.description,
      year_launched: video.year_launched,
      duration: video.duration,
      rating: video.rating,
      is_opened: video.is_opened,
      is_published: video.is_published,
      banner: video.banner!,
      thumbnail: video.thumbnail!,
      thumbnail_half: video.thumbnail_half!,
      trailer: video.trailer!,
      video: video.video!,
      categories_id: Array.from(video.categories_id.values()),
      genres_id: Array.from(video.genres_id.values()),
      cast_members_id: Array.from(video.cast_members_id.values()),
      created_at: video.created_at,
    });
  }
}