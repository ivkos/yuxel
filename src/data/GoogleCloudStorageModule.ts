import { Module } from "@nestjs/common"
import { ConfigurationModule } from "../config/ConfigurationModule"
import { Storage } from "@google-cloud/storage"
import { Configuration } from "../config/Configuration"
import { ConfigKey } from "../config/ConfigKey"

@Module({
    imports: [ConfigurationModule],
    providers: [{
        provide: Storage,
        inject: [Configuration],
        useFactory: (config: Configuration) => {
            const storageAuth = config.get(ConfigKey.GCP_STORAGE_AUTH)

            if (storageAuth === "default") {
                return new Storage()
            }

            return new Storage({ keyFilename: storageAuth })
        },
    }],
    exports: [Storage],
})
export class GoogleCloudStorageModule {}