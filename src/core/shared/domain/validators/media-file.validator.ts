import { IMediaFile } from "../value-objects/image-media.vo";

export class MediaFileValidator {
  private constructor(
    private readonly max_size: number,
    private readonly mimes_types: string[],
  ) { }

  static create(max_size: number, mimes_types: string[]) {
    return new MediaFileValidator(max_size, mimes_types);
  }

  static validate(file: IMediaFile, max_size: number, mimes_types: string[]) {
    const mediaFileValidator = new MediaFileValidator(max_size, mimes_types);
    return mediaFileValidator.validate(file, max_size, mimes_types);
  }

  validate(file: IMediaFile, max_size: number, mimes_types: string[]) {
    if (!this.validateMimeType(file.mime_type))
      throw new InvalidMediaFileMimeTypeError(mimes_types.join(', '), this.mimes_types);
    if (!this.validateSize(file.size))
      throw new InvalidMediaFileSizeError(file.size, this.max_size);

    return {
      name: this.generateRendomName(file.raw_name),
    }
  }

  private validateMimeType(mimes_types: IMediaFile['mime_type']): boolean {
    const isValid = this.mimes_types.some((mime) => mimes_types.includes(mime));
    return isValid;
  }

  private validateSize(size: IMediaFile['size']): boolean {
    return size <= this.max_size;
  }

  private generateRendomName(raw_name) {
    const [name, ext] = raw_name.split('.');
    return `${name}-${crypto.randomUUID()}.${ext}`;
  }
}

export class InvalidMediaFileSizeError extends Error {
  constructor(actual_size: number, max_size: number) {
    super(`Invalid media file size: ${actual_size} > ${max_size}`);
    this.name = "InvalidMidiaFileSizeError";
  }
}

export class InvalidMediaFileMimeTypeError extends Error {
  constructor(actual_mime: string, valid_mimes: string[]) {
    super(`Invalid media file mime type: ${actual_mime} not in ${valid_mimes.join(', ')}`);
    this.name = "InvalidMidiaFileMimeTypeError";
  }
}