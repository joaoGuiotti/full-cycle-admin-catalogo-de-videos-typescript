import { CastMember } from "@core/cast-member/domain/cast-member.aggregate";
import { CastMemberInMemoryRepository } from "./cast-member-in-memory.repository";

describe('CastMemberInMemoryRepository', () => {
  let repo: CastMemberInMemoryRepository;

  beforeEach(() => (repo = new CastMemberInMemoryRepository()));

  it('Should no filter items when filter object is null', async () => {
    const items = [CastMember.fake().anActor().build()];
    const filterSpy = jest.spyOn(items, 'filter' as any);

    const itemsFiltered = await repo['applyFilter'](items, null!);
    expect(filterSpy).not.toHaveBeenCalled();
    expect(itemsFiltered).toStrictEqual(items);
  });

  it('Sould filter items using parameter', async () => {
    const items = [
      CastMember.fake().anActor().withName('test').build(),
      CastMember.fake().anActor().withName('TEST').build(),
      CastMember.fake().anActor().withName('fake').build()
    ];
    const filterSpy = jest.spyOn(items, 'filter');

    const itemsFiltered = await repo['applyFilter'](items, 'TEST');
    expect(filterSpy).toHaveBeenCalledTimes(1);
    expect(itemsFiltered).toStrictEqual([
      items[0],
      items[1],
    ]);
  });
  it('Sould sort by created_at when sort param is null', async () => {

    const created_at = new Date();
    const createTime = (ms: number) => new Date(created_at.getTime() + ms);
    const items = [
      CastMember.fake()
        .anActor()
        .withName('test')
        .withCreatedAt(createTime(50))
        .build(),
      CastMember.fake()
        .anActor()
        .withName('test 1')
        .withCreatedAt(createTime(100))
        .build(),
      CastMember.fake()
        .anActor()
        .withName('test 2')
        .withCreatedAt(createTime(200))
        .build(),
      CastMember.fake()
        .anActor()
        .withName('test 3')
        .withCreatedAt(createTime(300))
        .build()
    ];
    const itemsSorted = await repo['applySort'](items, null, null);
    expect(itemsSorted).toStrictEqual(items.reverse());
  });

  it('Shloud sort by name', async () => {
    const items = [
      CastMember.fake().anActor().withName('c').build(),
      CastMember.fake().anActor().withName('b').build(),
      CastMember.fake().anActor().withName('a').build(),
    ];

    let itemsSorted = await repo['applySort'](items, 'name', 'asc');
    expect(itemsSorted).toStrictEqual([
      items[2],
      items[1],
      items[0],
    ]);

    itemsSorted = await repo['applySort'](items, 'name', 'desc');
    expect(itemsSorted).toStrictEqual([
      items[0],
      items[1],
      items[2],
    ]);
  });

});