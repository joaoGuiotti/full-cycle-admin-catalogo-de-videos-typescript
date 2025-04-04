import { InvalidRatingError, Rating, RatingValues } from "../rating.vo";

describe('Rating Value Object', () => {
  it('should create RL rating', () => {
    const rating = Rating.createRL();
    expect(rating.value).toBe(RatingValues.RL);
  });

  it('should create R10 rating', () => {
    const rating = Rating.createR10();
    expect(rating.value).toBe(RatingValues.R10);
  });

  it('should create R12 rating', () => {
    const rating = Rating.createR12();
    expect(rating.value).toBe(RatingValues.R12);
  });

  it('should create R14 rating', () => {
    const rating = Rating.createR14();
    expect(rating.value).toBe(RatingValues.R14);
  });

  it('should create R16 rating', () => {
    const rating = Rating.createR16();
    expect(rating.value).toBe(RatingValues.R16);
  });

  it('should create R18 rating', () => {
    const rating = Rating.createR18();
    expect(rating.value).toBe(RatingValues.R18);
  });

  it('should create a rating with a specific value', () => {
    const rating = Rating.with(RatingValues.R16);
    expect(rating.value).toBe(RatingValues.R16);
  });

  it('should fail to create a Rating with invalid value', () => {
    expect(() => Rating.with('invalid' as any)).toThrow(InvalidRatingError);
  });
});