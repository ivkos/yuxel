import { Controller, Get } from "@nestjs/common"
import { GeneratedNews } from "./dto/GeneratedNews"
import { NewsProviderService } from "../news/providers/NewsProviderService"
import { MarkovService } from "../news/scrape/MarkovService"

@Controller("/news")
export class NewsController {
    constructor(private readonly newsProviderService: NewsProviderService,
                private readonly markovService: MarkovService) {}

    @Get("/")
    async getNews(): Promise<GeneratedNews> {
        const titleBundle = await this.markovService.getBundle("title")
        const summaryBundle = await this.markovService.getBundle("title")

        return {
            title: titleBundle.markovski.generate().toUpperCase(),
            summary: summaryBundle.markovski.generate().toUpperCase(),
        }
    }
}