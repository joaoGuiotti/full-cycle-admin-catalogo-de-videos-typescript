import { GoogleCloudStorage } from '@core/shared/infra/storage/google-cloud.storage';
import { Storage as GoogleCloudStorageSdk } from '@google-cloud/storage';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: 'IStorage',
      useFactory: (configService: ConfigService) => {
        const credentials = configService.get('GOOGLE_CLOUD_CREDENTIALS');
        const bucketName = configService.get('GOOGLE_CLOUD_STORAGE_BUCKET_NAME');
        const storage = new GoogleCloudStorageSdk({ credentials });
        return new GoogleCloudStorage(storage, bucketName)
      },
      inject: [ConfigService]
    },
  ],
  exports: ['IStorage']
})
export class SharedModule { }
// modulo de eventos para poder registrar os ouvintes
