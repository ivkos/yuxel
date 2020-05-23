import { Module } from "@nestjs/common"
import { FirestoreModule } from "./FirestoreModule"
import { GoogleCloudStorageModule } from "./GoogleCloudStorageModule"

@Module({
    imports: [
        FirestoreModule,
        GoogleCloudStorageModule,
    ],
    exports: [
        FirestoreModule,
        GoogleCloudStorageModule,
    ],
})
export class DataModule {}