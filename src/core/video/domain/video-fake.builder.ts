import { NullableOr } from "../../shared/domain/nullable";
import { Video, VideoCreateCommand, VideoId } from "./video.aggregate";
import { Chance } from "chance";
import { Rating } from "./rating.vo";
import { Banner } from "./banner.vo";
import { Thumbnail } from "./thumbnail.vo";
import { ThumbnailHalf } from "./thumbnail-half.vo";
import { Trailer } from "./trailer.vo";
import { VideoMedia } from "./video-media.vo";
import { CategoryId } from "../../category/domain/category.aggregate";
import { GenreId } from "../../genre/domain/genre.aggregate";
import { CastMemberId } from "../../cast-member/domain/cast-member.aggregate";

type PropOrFactory<T> = T | ((index: number) => T);

export class VideoFakeBuilder<TBuild = any> {
  private _video_id: NullableOr<PropOrFactory<VideoId>> = undefined;
  private _title: PropOrFactory<string> = (_index) => this.chance.word();
  private _description: PropOrFactory<string> = (_index) => this.chance.sentence();
  private _year_launched: PropOrFactory<number> = (_index) => +this.chance.year();
  private _duration: PropOrFactory<number> = (_index) => this.chance.integer({ min: 1, max: 100 });
  private _rating: PropOrFactory<Rating> = (_index) => Rating.createRL();
  private _opened: PropOrFactory<boolean> = (_index) => true;
  private _banner: NullableOr<PropOrFactory<Banner>> = new Banner('test-name-banner.jpg', 'videos/1/imagens');
  private _thumbnail: NullableOr<PropOrFactory<Thumbnail>> = new Thumbnail('test-name-thumbnail.jpg', 'videos/1/imagens');
  private _thumbnail_half: NullableOr<PropOrFactory<ThumbnailHalf>> = new ThumbnailHalf('test-name-thumbnail-half.jpg', 'videos/1/imagens');
  private _trailer: NullableOr<PropOrFactory<Trailer>> = Trailer.create({
    name: 'test-name-trailer.mp4',
    raw_location: 'test path trailer',
  });
  private _video: NullableOr<PropOrFactory<VideoMedia>> = VideoMedia.create({
    name: 'test-name-video.mp4',
    raw_location: 'test path video',
  });
  private _categories_id: PropOrFactory<CategoryId>[] = [];
  private _genres_id: PropOrFactory<GenreId>[] = [];
  private _cast_members_id: PropOrFactory<CastMemberId>[] = [];
  private _created_at: PropOrFactory<Date> | undefined = undefined;

  private chance: Chance.Chance;
  private countObjs: number;

  private callFactory(factoryOrValue: PropOrFactory<any>, index: number) {
    if (typeof factoryOrValue === 'function')
      return factoryOrValue(index);
    if (factoryOrValue instanceof Array)
      return factoryOrValue.map((value) => this.callFactory(value, index));
    return factoryOrValue;
  }

  private getValue(prop: any) {
    const optional = ['video_id', 'created_at'];
    const privateProp = `_${prop}` as keyof this;
    if (!this[privateProp] && optional.includes(prop)) {
      throw new Error(
        `Property ${prop} not have a factory, use 'with' methods`,
      );
    }
    return this.callFactory(this[privateProp], 0);
  }

  constructor(countObjs: number = 1) {
    this.countObjs = countObjs;
    this.chance = Chance();
  }

  static aVideoWithoutMedias() {
    return new VideoFakeBuilder<Video>()
      .withoutBanner()
      .withoutThumbnail()
      .withoutThumbnailHalf()
      .withoutTrailer()
      .withoutVideo();
  }

  static aVideoWithAllMedias() {
    return new VideoFakeBuilder<Video>();
  }

  static theVideosWithoutMedias(countObjs: number) {
    return new VideoFakeBuilder<Video[]>(countObjs)
      .withoutBanner()
      .withoutThumbnail()
      .withoutThumbnailHalf()
      .withoutTrailer()
      .withoutVideo();
  }

  static theVideosWithAllMedias(countObjs: number) {
    return new VideoFakeBuilder<Video[]>(countObjs);
  }

  withVideoId(valueOrFactory: PropOrFactory<VideoId>): this {
    this._video_id = valueOrFactory;
    return this;
  }

  withTitle(valueOrFactory: PropOrFactory<string>): this {
    this._title = valueOrFactory;
    return this;
  }

  withDescription(valueOrFactory: PropOrFactory<string>): this {
    this._description = valueOrFactory;
    return this;
  }

  withYearLaunched(valueOrFactory: PropOrFactory<number>): this {
    this._year_launched = valueOrFactory;
    return this;
  }

  withDuration(valueOrFactory: PropOrFactory<number>): this {
    this._duration = valueOrFactory;
    return this;
  }

  withRating(valueOrFactory: PropOrFactory<Rating>): this {
    this._rating = valueOrFactory;
    return this;
  }

  markAsOpened(): this {
    this._opened = true;
    return this;
  }

  markAsClosed(): this {
    this._opened = false;
    return this;
  }

  withBanner(valueOrFactory: PropOrFactory<Banner>): this {
    this._banner = valueOrFactory;
    return this;
  }

  withoutBanner(): this {
    this._banner = null;
    return this;
  }

  withThumbnail(valueOrFactory: PropOrFactory<Thumbnail>): this {
    this._thumbnail = valueOrFactory;
    return this;
  }

  withoutThumbnail(): this {
    this._thumbnail = null;
    return this;
  }

  withThumbnailHalf(valueOrFactory: PropOrFactory<ThumbnailHalf>): this {
    this._thumbnail_half = valueOrFactory;
    return this;
  }

  withoutThumbnailHalf(): this {
    this._thumbnail_half = null;
    return this;
  }

  withTrailer(valueOrFactory: PropOrFactory<Trailer>): this {
    this._trailer = valueOrFactory;
    return this;
  }

  withoutTrailer(): this {
    this._trailer = null;
    return this;
  }

  withVideo(valueOrFactory: PropOrFactory<VideoMedia>): this {
    this._video = valueOrFactory;
    return this;
  }

  withoutVideo(): this {
    this._video = null;
    return this;
  }

  addCategoryId(valueOrFactory: PropOrFactory<CategoryId>): this {
    this._categories_id.push(valueOrFactory);
    return this;
  }

  addGenreId(valueOrFactory: PropOrFactory<GenreId>): this {
    this._genres_id.push(valueOrFactory);
    return this;
  }

  addCastMemberId(valueOrFactory: PropOrFactory<CastMemberId>): this {
    this._cast_members_id.push(valueOrFactory);
    return this;
  }

  withCreatedAt(valueOrFactory: PropOrFactory<Date>): this {
    this._created_at = valueOrFactory;
    return this;
  }

  withInvalidTitleTooLong(value?: string): this {
    this._title = value ?? this.chance.word({ length: 256 });
    return this;
  }

  get video_id() {
    return this.getValue('video_id');
  }

  get title() {
    return this.getValue('title');
  }

  get description() {
    return this.getValue('description');
  }

  get year_launched() {
    return this.getValue('year_launched');
  }

  get duration() {
    return this.getValue('duration');
  }

  get rating() {
    return this.getValue('rating');
  }

  get is_opened() {
    return this.getValue('is_opened');
  }

  get banner() {
    const banner = this.getValue('banner');
    return (banner ?? new Banner('test-name-banner.png', 'test path banner'));
  }

  get thumbnail() {
    const thumbnail = this.getValue('thumbnail');
    return (thumbnail ?? new Thumbnail('test-name-thumbnail.png', 'test path thumbnail'));
  }

  get thumbnail_half() {
    const thumbnail_half = this.getValue('thumbnail_half');
    return (thumbnail_half ?? new ThumbnailHalf('test-name-thumbnail-half.png', 'test path thumbnail half'));
  }

  get trailer() {
    const trailer = this.getValue('trailer');
    return (trailer ?? Trailer.create({
      name: 'test-name-trailer.mp4',
      raw_location: 'test path trailer',
    }));
  }

  get video() {
    const video = this.getValue('video');
    return (video ?? VideoMedia.create({
      name: 'test-name-video.mp4',
      raw_location: 'test path video',
    }));
  }

  get categories_id(): CategoryId[] {
    let categories_id = this.getValue('categories_id');

    if (!categories_id.length) {
      categories_id = [new CategoryId()];
    }
    return categories_id;
  }

  get genres_id(): GenreId[] {
    let genres_id = this.getValue('genres_id');

    if (!genres_id.length) {
      genres_id = [new GenreId()];
    }
    return genres_id;
  }

  get cast_members_id(): CastMemberId[] {
    let cast_members_id = this.getValue('cast_members_id');

    if (!cast_members_id.length) {
      cast_members_id = [new CastMemberId()];
    }

    return cast_members_id;
  }

  get created_at() {
    return this.getValue('created_at');
  }

  build(): TBuild {
    const videos = new Array(this.countObjs).fill(undefined).map((_, index) => {
      const categoryId = new CategoryId();
      const categoriesId = this._categories_id.length
        ? this.callFactory(this._categories_id, index)
        : [categoryId];

      const genreId = new GenreId();
      const genresId = this._genres_id.length
        ? this.callFactory(this._genres_id, index)
        : [genreId];

      const castMemberId = new CastMemberId();
      const castMembersId = this._cast_members_id.length
        ? this.callFactory(this._cast_members_id, index)
        : [castMemberId];

      const video = Video.create({
        title: this.callFactory(this._title, index),
        description: this.callFactory(this._description, index),
        year_launched: this.callFactory(this._year_launched, index),
        duration: this.callFactory(this._duration, index),
        rating: this.callFactory(this._rating, index),
        is_opened: this.callFactory(this._opened, index),
        banner: this.callFactory(this._banner, index),
        thumbnail: this.callFactory(this._thumbnail, index),
        thumbnail_half: this.callFactory(this._thumbnail_half, index),
        trailer: this.callFactory(this._trailer, index),
        video: this.callFactory(this._video, index),
        categories_id: categoriesId,
        genres_id: genresId,
        cast_members_id: castMembersId,
        ...(this._created_at && {
          created_at: this.callFactory(this._created_at, index),
        }),
      });
      video['video_id'] = !this._video_id
        ? video['video_id']
        : this.callFactory(this._video_id, index);
      video.validate();
      return video;
    }) as TBuild;
    return this.countObjs === 1 ? (videos[0]) : videos;
  }


}