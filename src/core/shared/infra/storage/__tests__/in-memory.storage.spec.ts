import { InMemoryStorage } from "../in-memory.storage";

describe('InMemoryStorage', () => {
  let storage: InMemoryStorage;

  beforeEach(() => {
    storage = new InMemoryStorage();
  });

  it('should store and retrieve an object', async () => {
    const object = { id: '1', name: 'test', data: Buffer.from('test') };
    await storage.store(object);

    const retrievedObject = await storage.get('1');
    expect(retrievedObject).toEqual({
      name: 'test',
      data: Buffer.from('test')
    });
  });

  it('should throw an error if the object is not found', async () => {
    await expect(storage.get('non-existent-id'))
      .rejects.toThrow('File non-existent-id not found');
  });

});