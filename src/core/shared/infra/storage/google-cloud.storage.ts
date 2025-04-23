import { IStorage, StoreGetOutput, StoreObjectInput } from "../../application/storage.interafce";
import { Storage as GoogleCloudStorageSdk } from "@google-cloud/storage";

export class GoogleCloudStorage implements IStorage {

  constructor(
    private readonly storageSdk: GoogleCloudStorageSdk,
    private readonly bucketName: string,
  ) { }

  store(object: StoreObjectInput): Promise<void> {
    const bucket = this.storageSdk.bucket(this.bucketName);
    const file = bucket.file(object.id);
    return file.save(object.data, {
      metadata: { contentType: object.mime_type },
    });
  }

  async get(id: string): Promise<StoreGetOutput> {
    const file = this.storageSdk.bucket(this.bucketName).file(id);
    const [metadata, content] = await Promise.all([
      file.getMetadata(),
      file.download(),
    ]);
    return {
      mime_type: metadata[0].contentType,
      data: content[0],
    };
  }

}