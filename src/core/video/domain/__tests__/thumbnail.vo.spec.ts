

import { InvalidMediaFileMimeTypeError, InvalidMediaFileSizeError } from "../../../shared/domain/validators/media-file.validator";
import { Thumbnail } from "../thumbnail.vo";
import { VideoId } from "../video.aggregate";

describe('Thumbnail Unit Tests', () => {
  it('should create a Thumbnail object from a valid JPEG file', () => {
    const data = Buffer.alloc(1024);
    const videoId = new VideoId();
    const [thumbnail, error] = Thumbnail.createFromFile({
      raw_name: 'test.jpg',
      mime_type: 'image/jpeg',
      size: data.length,
      video_id: videoId,
    }).asArray();

    expect(error).toBeNull();
    expect(thumbnail).toBeInstanceOf(Thumbnail);
    expect(thumbnail.name).toMatch(/\.jpg$/);
    expect(thumbnail.location).toBe(`videos/${videoId.id}/thumbnails`);
  });

  it('should create a Thumbnail object from a valid PNG file', () => {
    const data = Buffer.alloc(1024);
    const videoId = new VideoId();
    const [thumbnail, error] = Thumbnail.createFromFile({
      raw_name: 'test.png',
      mime_type: 'image/png',
      size: data.length,
      video_id: videoId,
    }).asArray();

    expect(thumbnail).toBeInstanceOf(Thumbnail);

    expect(error).toBeNull();
    expect(thumbnail).toBeInstanceOf(Thumbnail);
    expect(thumbnail.name).toMatch(/\.png$/);
    expect(thumbnail.location).toBe(`videos/${videoId.id}/thumbnails`);
  });

  it('should throw an error if the file size exceeds max_size', () => {
    const data = Buffer.alloc(Thumbnail.max_size + 1);
    const videoId = new VideoId();
    const [thumbnail, error] = Thumbnail.createFromFile({
      raw_name: 'test.jpg',
      mime_type: 'image/jpeg',
      size: data.length,
      video_id: videoId,
    }).asArray();

    expect(thumbnail).toBeNull();
    expect(error).toBeInstanceOf(InvalidMediaFileSizeError);
  });

  it('should throw an error if mime type is not allowed', () => {
    const data = Buffer.alloc(1024);
    const videoId = new VideoId();
    const [thumbnail, error] = Thumbnail.createFromFile({
      raw_name: 'test.gif',
      mime_type: 'image/gif',
      size: data.length,
      video_id: videoId,
    }).asArray();

    expect(thumbnail).toBeNull();
    expect(error).toBeInstanceOf(InvalidMediaFileMimeTypeError);
  });

  it('should have correct static properties', () => {
    expect(Thumbnail.max_size).toBe(2 * 1024 * 1024); // 2MB
    expect(Thumbnail.mimes_types).toEqual(['image/jpeg', 'image/png']);
  });
});