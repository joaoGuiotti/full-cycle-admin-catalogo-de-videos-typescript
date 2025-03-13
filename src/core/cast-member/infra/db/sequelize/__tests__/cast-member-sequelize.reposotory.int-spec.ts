import { Sequelize } from "sequelize-typescript";
import { Uuid } from "../../../../../shared/domain/value-objects/uuid.vo";
import { NotFoundError } from "../../../../../shared/domain/errors/not-found.error";
import { setupSequelize } from "../../../../../shared/infra/helpers/helpers";
import { CastMemberModel } from "../cast-member.model";
import { CastMemberSequelizeRepository } from "../cast-member-sequelize.repository";
import { CastMember, CastMemberTypes } from "@core/cast-member/domain/cast-member.aggregate";
import { CastMemberModelMapper } from "../cast-member-mapper";
import { CastMemberSearchParams, CastMemberSearchResult } from "@core/cast-member/domain/cast-member.repository";

describe('CastMemberSequelizeRepository Integration it', () => {
  let repository!: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(async () => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
  });

  it('Should insert a new category', async () => {
    let category = CastMember.fake().anActor().withName('movie').build();
    await repository.insert(category);
    let entity = await repository.findById(category.cast_member_id);
    expect(entity?.toJSON()).toStrictEqual(category.toJSON());

    category = CastMember.fake().anActor()
      .withName('Movie')
      .build();

    await repository.insert(category);
    entity = await repository.findById(category.cast_member_id);
    expect(entity?.toJSON()).toStrictEqual(category.toJSON());
  });

  it('Should finds a entoty by id', async () => {
    let entityFound = await repository.findById(new Uuid());
    expect(entityFound).toBeNull();

    const category = CastMember.fake().anActor().withName('Movie').build();
    await repository.insert(category);
    entityFound = await repository.findById(category.cast_member_id);
    expect(category.toJSON()).toStrictEqual(entityFound?.toJSON());
  });

  it('Should return all categories', async () => {
    let category = CastMember.fake().anActor().withName('Movie').build();
    await repository.insert(category);
    const entities = await repository.findAll();
    expect(entities).toHaveLength(1);
    expect(entities[0].toJSON()).toStrictEqual(category.toJSON());
    expect(JSON.stringify(entities)).toBe(JSON.stringify([category]));
  });

  it('Should throw error on update when a entity not found', async () => {
    const category = CastMember.fake().anActor().build();
    await expect(repository.update(category)).rejects.toThrow(
      new NotFoundError(category.cast_member_id.id, CastMember)
    );
  });

  it('Should update a entity', async () => {
    const category = CastMember.fake().anActor().build();
    await repository.insert(category);

    category.changeName('Movie Update');
    await repository.update(category);

    const entityFound = await repository.findById(category.cast_member_id);
    expect(category.toJSON()).toStrictEqual(entityFound?.toJSON());
  });

  it('Should throw error on delete when a entity not found', async () => {
    const category = CastMember.fake().anActor().build();
    await expect(repository.delete(category.cast_member_id)).rejects.toThrow(
      new NotFoundError(category.cast_member_id.id, CastMember)
    );
  });

  it('Should throw error on delete when a entity not found', async () => {
    const category = CastMember.fake().anActor().build();
    await repository.insert(category);

    await repository.delete(category.cast_member_id);
    const entity = await repository.findById(category.cast_member_id)
    expect(entity).toBeNull();
  });

  describe('Search method tests', () => {

    it('Should only apply paginate when other params are null', async () => {
      const created_at = new Date();
      const categories = CastMember.fake()
        .theCastMembers(16)
        .withName('Movie')
        .withType(CastMemberTypes.ACTOR)
        .withCreatedAt(created_at)
        .build();

      await repository.bulkInsert(categories);

      const spyToEntity = jest.spyOn(CastMemberModelMapper, 'toEntity');

      const searchOutput = await repository.search(new CastMemberSearchParams());
      expect(searchOutput).toBeInstanceOf(CastMemberSearchResult);
      expect(spyToEntity).toHaveBeenCalledTimes(15);
      expect(searchOutput.toJSON()).toMatchObject({
        total: 16,
        current_page: 1,
        last_page: 2,
        per_page: 15
      });
      searchOutput.items.forEach((item) => {
        expect(item).toBeInstanceOf(CastMember);
        expect(item.cast_member_id).toBeDefined();
      });

      const items = searchOutput.items.map((item) => item.toJSON());

      expect(items).toMatchObject(
        new Array(15).fill({
          name: 'Movie',
          type: CastMemberTypes.ACTOR,
          created_at
        })
      );

    });

    it('Should order by created_at DESC when search params are null', async () => {
      const created_at = new Date();
      const categories = CastMember.fake()
        .theCastMembers(16)
        .withName((index) => `Movie ${index}`)
        .withType(CastMemberTypes.ACTOR)
        .withCreatedAt((index) => new Date(created_at.getTime() + index))
        .build();
      await repository.bulkInsert(categories);

      const searchOutput = await repository.search(new CastMemberSearchParams());
      const items = searchOutput.items;
      [...items].reverse().forEach((item, index) => {
        expect(`${item.name}`).toBe(`${categories[index + 1].name}`);
      })
    });

    it('Should apply paginate and filter', async () => {
      const categories = [
        CastMember.fake().anActor()
          .withName('test')
          .withCreatedAt(new Date(new Date().getTime() + 5000))
          .build(),
        CastMember.fake().anActor()
          .withName('a')
          .withCreatedAt(new Date(new Date().getTime() + 4000))
          .build(),
        CastMember.fake().anActor()
          .withName('TEST')
          .withCreatedAt(new Date(new Date().getTime() + 3000))
          .build(),
        CastMember.fake().anActor()
          .withName('TeSt')
          .withCreatedAt(new Date(new Date().getTime() + 1000))
          .build(),
      ];
      await repository.bulkInsert(categories);
      let searchOutput = await repository.search(
        new CastMemberSearchParams({
          page: 1,
          per_page: 2,
          filter: 'TEST'
        })
      );

      expect(searchOutput.toJSON(true)).toMatchObject(
        new CastMemberSearchResult({
          items: [categories[0], categories[2]],
          total: 3,
          current_page: 1,
          per_page: 2
        }).toJSON(true)
      );

      searchOutput = await repository.search(
        new CastMemberSearchParams({
          page: 2,
          per_page: 2,
          filter: 'TEST'
        })
      );

      expect(searchOutput.toJSON(true)).toMatchObject(
        new CastMemberSearchResult({
          items: [categories[3]],
          total: 3,
          current_page: 2,
          per_page: 2
        }).toJSON(true)
      );
    });

    it('Should apply paginate and sort', async () => {
      expect(repository.sortableFields).toStrictEqual(['name', 'created_at']);

      const categories = [
        CastMember.fake().anActor().withName('b').build(),
        CastMember.fake().anActor().withName('a').build(),
        CastMember.fake().anActor().withName('d').build(),
        CastMember.fake().anActor().withName('e').build(),
        CastMember.fake().anActor().withName('c').build(),
      ];

      await repository.bulkInsert(categories);

      const arrange = [
        {
          params: new CastMemberSearchParams({
            page: 1,
            per_page: 2,
            sort: 'name'
          }),
          result: new CastMemberSearchResult({
            items: [categories[1], categories[0]],
            total: 5,
            current_page: 1,
            per_page: 2
          })
        },
        {
          params: new CastMemberSearchParams({
            page: 2,
            per_page: 2,
            sort: 'name'
          }),
          result: new CastMemberSearchResult({
            items: [categories[4], categories[2]],
            total: 5,
            current_page: 2,
            per_page: 2
          })
        },
        {
          params: new CastMemberSearchParams({
            page: 3,
            per_page: 2,
            sort: 'name'
          }),
          result: new CastMemberSearchResult({
            items: [categories[3]],
            total: 5,
            current_page: 3,
            per_page: 2
          })
        }
      ];

      for (const i of arrange) {
        const result = await repository.search(i.params);
        expect(result.toJSON(true)).toMatchObject(i.result.toJSON(true));
      }
    });

    describe('should search using filter, sort and paginate', () => {
      const categories = [
        CastMember.fake().anActor().withName('test').build(),
        CastMember.fake().anActor().withName('a').build(),
        CastMember.fake().anActor().withName('TEST').build(),
        CastMember.fake().anActor().withName('e').build(),
        CastMember.fake().anActor().withName('TeSt').build(),
      ];

      const arrange = [
        {
          search_params: new CastMemberSearchParams({
            page: 1,
            per_page: 2,
            sort: 'name',
            filter: 'TEST',
          }),
          search_result: new CastMemberSearchResult({
            items: [categories[2], categories[4]],
            total: 3,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          search_params: new CastMemberSearchParams({
            page: 2,
            per_page: 2,
            sort: 'name',
            filter: 'TEST',
          }),
          search_result: new CastMemberSearchResult({
            items: [categories[0]],
            total: 3,
            current_page: 2,
            per_page: 2,
          }),
        },
      ];

      beforeEach(async () => {
        await repository.bulkInsert(categories);
      });

      test.each(arrange)(
        'when value is $search_params',
        async ({ search_params, search_result }) => {
          const result = await repository.search(search_params);
          expect(result.toJSON(true)).toMatchObject(search_result.toJSON(true));
        },
      );
    });

  });
});