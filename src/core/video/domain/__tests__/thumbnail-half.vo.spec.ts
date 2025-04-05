

import { InvalidMediaFileMimeTypeError, InvalidMediaFileSizeError } from "../../../shared/domain/validators/media-file.validator";
import { ThumbnailHalf } from "../thumbnail-half.vo";
import { VideoId } from "../video.aggregate";

describe('ThumbnailHalf Unit Tests', () => {
  it('should create a ThumbnailHalf object from a valid JPEG file', () => {
    const data = Buffer.alloc(1024);
    const videoId = new VideoId();
    const [thumbnailHalf, error] = ThumbnailHalf.createFromFile({
      raw_name: 'test.jpg',
      mime_type: 'image/jpeg',
      size: data.length,
      video_id: videoId,
    }).asArray();

    expect(error).toBeNull();
    expect(thumbnailHalf).toBeInstanceOf(ThumbnailHalf);
    expect(thumbnailHalf.name).toMatch(/\.jpg$/);
    expect(thumbnailHalf.location).toBe(`videos/${videoId.id}/thumbnailsHalfs`);
  });

  it('should create a ThumbnailHalf object from a valid PNG file', () => {
    const data = Buffer.alloc(1024);
    const videoId = new VideoId();
    const [thumbnailHalf, error] = ThumbnailHalf.createFromFile({
      raw_name: 'test.png',
      mime_type: 'image/png',
      size: data.length,
      video_id: videoId,
    }).asArray();

    expect(thumbnailHalf).toBeInstanceOf(ThumbnailHalf);

    expect(error).toBeNull();
    expect(thumbnailHalf).toBeInstanceOf(ThumbnailHalf);
    expect(thumbnailHalf.name).toMatch(/\.png$/);
    expect(thumbnailHalf.location).toBe(`videos/${videoId.id}/thumbnailsHalfs`);
  });

  it('should throw an error if the file size exceeds max_size', () => {
    const data = Buffer.alloc(ThumbnailHalf.max_size + 1);
    const videoId = new VideoId();
    const [thumbnailHalf, error] = ThumbnailHalf.createFromFile({
      raw_name: 'test.jpg',
      mime_type: 'image/jpeg',
      size: data.length,
      video_id: videoId,
    }).asArray();

    expect(thumbnailHalf).toBeNull();
    expect(error).toBeInstanceOf(InvalidMediaFileSizeError);
  });

  it('should throw an error if mime type is not allowed', () => {
    const data = Buffer.alloc(1024);
    const videoId = new VideoId();
    const [thumbnailHalf, error] = ThumbnailHalf.createFromFile({
      raw_name: 'test.gif',
      mime_type: 'image/gif',
      size: data.length,
      video_id: videoId,
    }).asArray();

    expect(thumbnailHalf).toBeNull();
    expect(error).toBeInstanceOf(InvalidMediaFileMimeTypeError);
  });

  it('should have correct static properties', () => {
    expect(ThumbnailHalf.max_size).toBe(2 * 1024 * 1024); // 2MB
    expect(ThumbnailHalf.mimes_types).toEqual(['image/jpeg', 'image/png']);
  });
});