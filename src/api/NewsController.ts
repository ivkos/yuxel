import { Controller, Get, Param } from "@nestjs/common"
import { GeneratedNews } from "./dto/GeneratedNews"
import { NewsService } from "../news/NewsService"

@Controller("/news")
export class NewsController {
    constructor(
        private readonly newsService: NewsService) {}

    @Get("/")
    async getNews(): Promise<GeneratedNews> {
        return await this.newsService.getNews()
    }

    @Get("/:providerId")
    async getNewsFromProvider(@Param("providerId") providerId: string): Promise<GeneratedNews> {
        return await this.newsService.getNewsFromProvider(providerId)
    }
}