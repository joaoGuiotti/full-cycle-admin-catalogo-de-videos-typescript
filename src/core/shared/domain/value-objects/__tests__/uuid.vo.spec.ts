import { InvalidUuidError, Uuid } from "../uuid.vo";
import { validate as uuidValidate } from 'uuid';

describe('Uuuid Unit Testes', () => {
  const validateSpy = jest.spyOn(Uuid.prototype as any, 'validate');

  test('Should throw an error when uuid is invalid', () => {
    expect(() => {
      new Uuid('invalid-error');
    }).toThrow(new InvalidUuidError())
    expect(validateSpy).toHaveBeenCalledTimes(1);
  });

  test('Should create a valid uuid', () => {
    const uuid = new Uuid();
    expect(uuid.id).toBeDefined();
    expect(uuidValidate(uuid.id)).toBe(true);
    expect(validateSpy).toHaveBeenCalledTimes(1);
  });

  test('Should accept a valid uuid', () => {
    const uuid = new Uuid('c3e9b0d0-7b6f-4a8e-8e1f-3f9e6a2f7e3C');
    expect(uuid.id).toBe('c3e9b0d0-7b6f-4a8e-8e1f-3f9e6a2f7e3C');
    expect(validateSpy).toHaveBeenCalledTimes(1);
  });
});