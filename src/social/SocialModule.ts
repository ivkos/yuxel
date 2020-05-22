import { Module } from "@nestjs/common"
import { ConfigurationModule } from "../config/ConfigurationModule"
import { SocialService } from "./SocialService"
import { DataModule } from "../data/DataModule"

@Module({
    imports: [ConfigurationModule, DataModule],
    providers: [SocialService],
    exports: [SocialService],
})
export class SocialModule {}
