import { Module } from "@nestjs/common"
import { ConfigurationModule } from "../config/ConfigurationModule"
import { IndexController } from "./IndexController"
import { NewsController } from "./NewsController"
import { NewsModule } from "../news/NewsModule"
import { ScraperController } from "./ScraperController"
import { DataModule } from "../data/DataModule"
import { SocialController } from "./SocialController"
import { SocialModule } from "../social/SocialModule"

@Module({
    imports: [
        ConfigurationModule,
        NewsModule,
        DataModule,
        SocialModule,
    ],
    providers: [],
    controllers: [
        IndexController,
        NewsController,
        ScraperController,
        SocialController,
    ],
})
export class ApiModule {}
