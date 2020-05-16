import { Module } from "@nestjs/common"
import { ConfigurationModule } from "../config/ConfigurationModule"
import { IndexController } from "./IndexController"
import { NewsController } from "./NewsController"
import { NewsModule } from "../news/NewsModule"
import { ScraperController } from "./ScraperController"
import { DataModule } from "../data/DataModule"

@Module({
    imports: [
        ConfigurationModule,
        NewsModule,
        DataModule,
    ],
    providers: [],
    controllers: [
        IndexController,
        NewsController,
        ScraperController,
    ],
})
export class ApiModule {}
