import { Injectable } from "@nestjs/common"
import { NewsProviderService } from "./providers/NewsProviderService"
import { MarkovService } from "./scrape/MarkovService"
import { GeneratedNews } from "../api/dto/GeneratedNews"
import { NewsProvider } from "./providers/NewsProvider"

@Injectable()
export class NewsService {
    constructor(private readonly newsProviderService: NewsProviderService,
                private readonly markovService: MarkovService) {}

    async getNews(): Promise<GeneratedNews> {
        const titleBundle = await this.markovService.getBundle("title")
        const summaryBundle = await this.markovService.getBundle("summary")

        return {
            title: titleBundle.markovski.generate().toUpperCase(),
            summary: summaryBundle.markovski.generate().toUpperCase(),
        }
    }

    async getNewsFromProvider(providerId: NewsProvider["id"]): Promise<GeneratedNews> {
        const provider = await this.newsProviderService.findById(providerId)

        const titleBundle = await this.markovService.getBundle("title", provider.id)
        const summaryBundle = await this.markovService.getBundle("summary", provider.id)

        return {
            title: titleBundle.markovski.generate().toUpperCase(),
            summary: summaryBundle.markovski.generate().toUpperCase(),
        }
    }
}