import { Undefined } from "../domain/nullable";

export interface IStorage {
  store(object: StoreObjectInput): Promise<void>;
  get(id: string): Promise<StoreGetOutput>;
}

export type StoreObjectInput = {
  data: Buffer;
  mime_type?: Undefined<string>;
  id: string;
}

export type StoreGetOutput = {
  data: Buffer;
  mime_type?: Undefined<string>;
}