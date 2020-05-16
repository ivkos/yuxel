import { Module } from "@nestjs/common"
import { Firestore } from "./Firestore"
import { ConfigurationModule } from "../config/ConfigurationModule"

@Module({
    imports: [
        ConfigurationModule,
    ],
    providers: [
        Firestore,
    ],
    exports: [
        Firestore,
    ],
})
export class DataModule {}