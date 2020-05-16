import { Module } from "@nestjs/common"
import { NewsProviderService } from "./providers/NewsProviderService"
import { ConfigurationModule } from "../config/ConfigurationModule"
import { EnabledNewsProviders } from "./providers/EnabledNewsProviders"
import { DataModule } from "../data/DataModule"
import { ScrapeService } from "./scrape/ScrapeService"
import { MarkovService } from "./scrape/MarkovService"

@Module({
    imports: [
        ConfigurationModule,
        DataModule,
    ],
    providers: [
        NewsProviderService,
        ScrapeService,
        MarkovService,
        ...EnabledNewsProviders,
    ],
    exports: [
        NewsProviderService,
        ScrapeService,
        MarkovService,
    ],
})
export class NewsModule {}