import { SearchParams } from "../search-params";


describe('Search Params unit test', () => {

  it('Page Prop', () => {
    const params = new SearchParams();
    expect(params.page).toBe(1);

    const arrange = [
      { page: null, expected: 1 },
      { page: undefined, expected: 1 },
      { page: '', expected: 1 },
      { page: "fake", expected: 1 },
      { page: 0, expected: 1 },
      { page: -1, expected: 1 },
      { page: true, expected: 1 },
      { page: false, expected: 1 },
      { page: {}, expected: 1 },
      { page: 1, expected: 1 },
      { page: 2, expected: 2 },
    ];

    arrange.forEach((i) => {
      const param = new SearchParams({ page: i.page as any })
      expect(param.page).toBe(i.expected);
    });
  });

  it('Per Page prop', () => {
    const params = new SearchParams();
    expect(params.per_page).toBe(15);

    const arrange = [
      { per_page: null, expected: 15 },
      { per_page: undefined, expected: 15 },
      { per_page: '', expected: 15 },
      { per_page: 'fake', expected: 15 },
      { per_page: 0, expected: 15 },
      { per_page: -1, expected: 15 },
      { per_page: 5.5, expected: 15 },
      { per_page: true, expected: 15 },
      { per_page: false, expected: 15 },
      { per_page: {}, expected: 15 },
      { per_page: 1, expected: 1 },
      { per_page: 2, expected: 2 },
      { per_page: 10, expected: 10 },
    ];
    arrange.forEach((i) => {
      const param = new SearchParams({ per_page: i.per_page as any });
      expect(param.per_page).toBe(i.expected)
    });
  });

  it('Sort prop', () => {
    const param = new SearchParams();
    expect(param.sort).toBe(null);

    const arrange: Array<any> = [
      { sort: null, expected: null },
      { sort: undefined, expected: null },
      { sort: '', expected: null },
      { sort: false, expected: 'false' },
      { sort: true, expected: 'true' },
      { sort: 5.5, expected: '5.5' },
      { sort: -1, expected: '-1' },
      { sort: 'field', expected: 'field' },
      { sort: {}, expected: '[object Object]' },
    ];

    arrange.forEach((i) => {
      const param = new SearchParams({ sort: i.sort as any });
      expect(param.sort).toBe(i.expected)
    });
  });

  it('Sort Direction prop', () => {
    const param = new SearchParams();
    expect(param.sort_dir).toBe(null);

    const arrange = [
      { sort_dir: null, expected: 'asc' },
      { sort_dir: undefined, expected: 'asc' },
      { sort_dir: '', expected: 'asc' },
      { sort_dir: false, expected: 'asc' },
      { sort_dir: true, expected: 'asc' },
      { sort_dir: 5.5, expected: 'asc' },
      { sort_dir: -1, expected: 'asc' },
      { sort_dir: 'field', expected: 'asc' },
      { sort_dir: 'asc', expected: 'asc' },
      { sort_dir: 'ASC', expected: 'asc' },
      { sort_dir: 'desc', expected: 'desc' },
      { sort_dir: 'DESC', expected: 'desc' },
    ];

    arrange.forEach((i) => {
      const param = new SearchParams({ sort: 'teste', sort_dir: i.sort_dir as any });
      expect(param.sort_dir).toBe(i.expected);
    });
  });

  it('Filter prop', () => {
    const param = new SearchParams();
    expect(param.filter).toBeNull();

    const arrange = [
      { filter: null, expected: null },
      { filter: undefined, expected: null },
      { filter: '', expected: null },
      { filter: false, expected: 'false' },
      { filter: true, expected: 'true' },
      { filter: 5.5, expected: '5.5' },
      { filter: -1, expected: '-1' },
      { filter: {}, expected: '[object Object]' },
      { filter: 'field', expected: 'field' },
    ];

    arrange.forEach((i) => {
      const param = new SearchParams({   filter: i.filter as any });
      expect(param.filter).toBe(i.expected);
    });
  });

});