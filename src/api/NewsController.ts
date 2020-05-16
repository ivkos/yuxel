import { Controller, Get, Param } from "@nestjs/common"
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

    @Get("/:providerId")
    async getNewsFromProvider(@Param("providerId") providerId: string): Promise<GeneratedNews> {
        const provider = await this.newsProviderService.findById(providerId)

        const titleBundle = await this.markovService.getBundle("title", provider.id)
        const summaryBundle = await this.markovService.getBundle("title", provider.id)

        return {
            title: titleBundle.markovski.generate().toUpperCase(),
            summary: summaryBundle.markovski.generate().toUpperCase(),
        }
    }
}