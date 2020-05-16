import { Controller, Get, Logger, Param, Post } from "@nestjs/common"
import { NewsProviderService } from "../news/providers/NewsProviderService"
import { NewsProviderDto } from "./dto/NewsProviderDto"
import { ScrapeService } from "../news/scrape/ScrapeService"

@Controller("/scraper")
export class ScraperController {
    private readonly logger: Logger = new Logger(ScraperController.name)

    constructor(private readonly providerService: NewsProviderService,
                private readonly scrapeService: ScrapeService) {}

    @Get("/providers")
    async getProviders() {
        return (await this.providerService.findAll()).map(np => NewsProviderDto.from(np))
    }

    @Post("/providers/:id/scrape")
    async doScrape(@Param("id") newsProviderId: string) {
        return this.scrapeService.scrapeSingleProvider(newsProviderId)
    }
}
