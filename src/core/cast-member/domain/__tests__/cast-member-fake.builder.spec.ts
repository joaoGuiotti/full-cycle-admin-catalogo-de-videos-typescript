import { Chance } from "chance";
import { Uuid } from "../../../shared/domain/value-objects/uuid.vo";
import { CastMemberFakeBuilder } from "../cast-member-fake.builder";
import { CastMemberTypes } from "../cast-member.aggregate";

describe('CastMemberFakeBuilder Unit Testes', () => {

  const faker = CastMemberFakeBuilder.anActor();

  describe('CategoryId Prop', () => {
    test('Should throw error when any with methods has called', () => {
      expect(() => faker.cast_member_id)
        .toThrow(
          new Error("Property cast_member_id not have a factory, use 'with' methods")
        )
    });

    test('Should be undefined', () => {
      expect(faker['_cast_member_id']).toBeUndefined();
    });

    test('WithUuid', () => {
      const cast_member_id = new Uuid();
      const $this = faker.withCastMemberId(cast_member_id);
      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect(faker['_cast_member_id']).toBe(cast_member_id);

      faker.withCastMemberId(() => cast_member_id);

      //@ts-expect-error _cast_member_id is a callable
      expect(faker['_cast_member_id']()).toBe(cast_member_id);
      expect(faker.cast_member_id).toBe(cast_member_id);
    });

    test('Should pass index to cast_member_id factory', () => {
      let mockFactory = jest.fn(() => new Uuid());
      faker.withCastMemberId(mockFactory);
      faker.build();
      expect(mockFactory).toHaveBeenCalledTimes(1);

      const castMemberId = new Uuid();
      mockFactory = jest.fn(() => castMemberId);
      const fakerMany = CastMemberFakeBuilder.theCastMembers(2);
      fakerMany.withCastMemberId(mockFactory);
      fakerMany.build();

      expect(mockFactory).toHaveBeenCalledTimes(2);
    });
  });

  describe('name prop', () => {
    const faker = CastMemberFakeBuilder.anActor();
    test('should be a function', () => {
      expect(typeof faker['_name']).toBe('function');
    });

    test('should call the word method', () => {
      const chance = Chance();
      const spyWordMethod = jest.spyOn(chance, 'word');
      faker['chance'] = chance;
      faker.build();

      expect(spyWordMethod).toHaveBeenCalled();
    });

    test('withName', () => {
      const $this = faker.withName('test name');
      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect(faker['_name']).toBe('test name');

      faker.withName(() => 'test name');
      //@ts-expect-error name is callable
      expect(faker['_name']()).toBe('test name');

      expect(faker.name).toBe('test name');
    });

    test('should pass index to name factory', () => {
      faker.withName((index) => `test name ${index}`);
      const castMember = faker.build();
      expect(castMember.name).toBe(`test name 0`);

      const fakerMany = CastMemberFakeBuilder.theCastMembers(2);
      fakerMany.withName((index) => `test name ${index}`);
      const categories = fakerMany.build();

      expect(categories[0].name).toBe(`test name 0`);
      expect(categories[1].name).toBe(`test name 1`);
    });

    test('invalid too long case', () => {
      const $this = faker.withInvalidNameTooLong();
      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect(faker['_name'].length).toBe(256);

      const tooLong = 'a'.repeat(256);
      faker.withInvalidNameTooLong(tooLong);
      expect(faker['_name'].length).toBe(256);
      expect(faker['_name']).toBe(tooLong);
    });
  });

  describe('created_at prop', () => {
    const faker = CastMemberFakeBuilder.anActor();

    test('should throw error when any with methods has called', () => {
      const fakerCategory = CastMemberFakeBuilder.anActor();
      expect(() => fakerCategory.created_at).toThrowError(
        new Error("Property created_at not have a factory, use 'with' methods"),
      );
    });

    test('should be undefined', () => {
      expect(faker['_created_at']).toBeUndefined();
    });

    test('withCreatedAt', () => {
      const date = new Date();
      const $this = faker.withCreatedAt(date);
      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect(faker['_created_at']).toBe(date);

      faker.withCreatedAt(() => date);
      //@ts-expect-error _created_at is a callable
      expect(faker['_created_at']()).toBe(date);
      expect(faker.created_at).toBe(date);
    });

    test('should pass index to created_at factory', () => {
      const date = new Date();
      faker.withCreatedAt((index) => new Date(date.getTime() + index + 2));
      const castMember = faker.build();
      expect(castMember.created_at.getTime()).toBe(date.getTime() + 2);

      const fakerMany = CastMemberFakeBuilder.theCastMembers(2);
      fakerMany.withCreatedAt((index) => new Date(date.getTime() + index + 2));
      const categories = fakerMany.build();

      expect(categories[0].created_at.getTime()).toBe(date.getTime() + 2);
      expect(categories[1].created_at.getTime()).toBe(date.getTime() + 3);
    });
  });

  test('should create a castMember', () => {
    const faker = CastMemberFakeBuilder.anActor();
    let castMember = faker.build();

    expect(castMember.cast_member_id).toBeInstanceOf(Uuid);
    expect(typeof castMember.name === 'string').toBeTruthy();
    expect(castMember.created_at).toBeInstanceOf(Date);

    const created_at = new Date();
    const cast_member_id = new Uuid();
    castMember = faker
      .withCastMemberId(cast_member_id)
      .withName('name test')
      .withType(CastMemberTypes.DIRECTOR)
      .withCreatedAt(created_at)
      .build();

    expect(castMember.cast_member_id.id).toBe(cast_member_id.id);
    expect(castMember.name).toBe('name test');
    expect(castMember.type).toBe(1);
    expect(castMember.created_at).toBe(created_at);
  });

  test('should create many categories', () => {
    const faker = CastMemberFakeBuilder.theCastMembers(2);
    let categories = faker.build();

    categories.forEach((castMember) => {
      expect(castMember.cast_member_id).toBeInstanceOf(Uuid);
      expect(typeof castMember.name === 'string').toBeTruthy();
      expect(typeof castMember.type === 'number').toBeTruthy();
      expect(castMember.created_at).toBeInstanceOf(Date);
    });

    const created_at = new Date();
    const cast_member_id = new Uuid();
    categories = faker
      .withCastMemberId(cast_member_id)
      .withName('name test')
      .withType(CastMemberTypes.ACTOR)
      .withCreatedAt(created_at)
      .build();

    categories.forEach((castMember) => {
      expect(castMember.cast_member_id.id).toBe(cast_member_id.id);
      expect(castMember.name).toBe('name test');
      expect(castMember.type).toBe(2);
      expect(castMember.created_at).toBe(created_at);
    });
  });
});


