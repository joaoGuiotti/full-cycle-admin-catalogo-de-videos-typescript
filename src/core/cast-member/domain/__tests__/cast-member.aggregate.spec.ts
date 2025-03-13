import { Uuid } from "@core/shared/domain/value-objects/uuid.vo";
import { CastMember, CastMemberTypes } from "../cast-member.aggregate"
describe('CastMember Without Validador Unit Tests', () => {
  beforeEach(() => {
    CastMember.prototype.validate = jest.fn()
      .mockImplementation(CastMember.prototype.validate);
  });

  test('constructor of CastMember', () => {
    let castMember = new CastMember({ name: 'João', type: 1 });
    expect(castMember.cast_member_id).toBeInstanceOf(Uuid);
    expect(castMember.name).toBe('João');
    expect(castMember.type).toBe(CastMemberTypes.DIRECTOR);
    expect(castMember.created_at).toBeInstanceOf(Date);
    let created_at = new Date();
    castMember = new CastMember({
      name: 'Cast',
      type: 2,
      created_at
    });
    expect(castMember.cast_member_id).toBeInstanceOf(Uuid);
    expect(castMember.name).toBe('Cast');
    expect(castMember.type).toBe(CastMemberTypes.ACTOR);
    expect(castMember.created_at).toBe(created_at);
  });

  describe('create command', () => {

    test('should create a cast member', () => {
      const castMember = CastMember.create({
        name: 'Cast 01', type: 2
      });
      expect(castMember.cast_member_id).toBeInstanceOf(Uuid);
      expect(castMember.name).toBe('Cast 01');
      expect(castMember.type).toBe(CastMemberTypes.ACTOR);
      expect(castMember.created_at).toBeInstanceOf(Date);
      expect(castMember.toJSON()).toStrictEqual({
        cast_member_id: castMember.cast_member_id.id,
        name: 'Cast 01',
        type: 2,
        created_at: castMember.created_at
      });
    });

  });

  describe('fake castMember create', () => {
    it('should create a fake castMember', () => {
      const castMember = CastMember.fake().anActor().build();
      expect(castMember).not.toBeNull();
      expect(castMember.cast_member_id).toBeInstanceOf(Uuid);
    });

  })

  describe('cast_member_id field', () => {
    const arrange = [{ id: null }, { id: undefined }, { id: new Uuid() }];
    test.each(arrange)('should be is %j', (props) => {
      const castMember = new CastMember(props as any);
      expect(castMember.cast_member_id).toBeInstanceOf(Uuid);
      expect(castMember.entity_id).toBeInstanceOf(Uuid);
    });
  });

  test('should change name', () => {
    const castMember = new CastMember({
      name: 'Cast', type: 1
    });
    castMember.changeName('other name');
    expect(castMember.name).toBe('other name');
    expect(CastMember.prototype.validate).toHaveBeenCalledTimes(1);
    expect(CastMember.prototype.validate).toHaveBeenCalledWith(['name']);
    expect(castMember.notification.hasErrors()).toBe(false);
  });

  test('should change type', () => {
    const castMember = new CastMember({
      name: 'Cast', type: CastMemberTypes.ACTOR
    });
    castMember.changeType(CastMemberTypes.DIRECTOR);
    expect(castMember.type).toBe(1);
    expect(CastMember.prototype.validate).not.toHaveBeenCalled();
    expect(castMember.notification.hasErrors()).toBe(false);
  });

  describe('Cast Member Validator', () => {
    describe('create command', () => {
      test('should an invalid category with name property', () => {
        const category = CastMember.create({ name: 't'.repeat(256), type: 1 });

        expect(category.notification.hasErrors()).toBe(true);
        expect(category.notification).notificationContainsErrorMessages([
          {
            name: ['name must be shorter than or equal to 255 characters'],
          },
        ]);
      });
    });

    describe('changeName method', () => {
      it('should a invalid cast member using name property', () => {
        const castMember = CastMember.create({ name: 'Movie', type: 1 });
        castMember.changeName('t'.repeat(256));
        expect(castMember.notification.hasErrors()).toBe(true);
        expect(castMember.notification).notificationContainsErrorMessages([
          {
            name: ['name must be shorter than or equal to 255 characters'],
          },
        ]);
      });
    });
  });

});