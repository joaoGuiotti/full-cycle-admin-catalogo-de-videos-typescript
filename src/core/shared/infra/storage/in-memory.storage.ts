import { IStorage, StoreGetOutput, StoreObjectInput } from "@core/shared/application/storage.interafce";

type StoregeObject = Omit<StoreObjectInput, 'id'>;

export class InMemoryStorage implements IStorage {
  private storage: Map<string, StoregeObject> = new Map();

  async store(object: StoreObjectInput): Promise<void> {
    const { id, ...otherProps } = object;
    this.storage.set(object.id, otherProps);
  }

  async get(id: string): Promise<StoreGetOutput> {
    const file = this.storage.get(id);

    if (!file)
      throw new Error(`File ${id} not found`);

    return ({
      ...file,
    });
  }
}