import { Module } from "@nestjs/common"
import { Firestore } from "./Firestore"
import { ConfigurationModule } from "../config/ConfigurationModule"
import { GoogleCloudStorage } from "./GoogleCloudStorage"

@Module({
    imports: [
        ConfigurationModule,
    ],
    providers: [
        Firestore,
        GoogleCloudStorage,
    ],
    exports: [
        Firestore,
        GoogleCloudStorage,
    ],
})
export class DataModule {}