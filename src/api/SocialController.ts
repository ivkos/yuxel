import { Controller, Post } from "@nestjs/common"
import { Configuration } from "../config/Configuration"
import { NewsService } from "../news/NewsService"
import { SocialService } from "../social/SocialService"


@Controller("/social")
export class SocialController {
    constructor(private readonly config: Configuration,
                private readonly newsService: NewsService,
                private readonly social: SocialService) {}

    @Post("/")
    async post() {
        const news = await this.newsService.getNews()

        await this.social.postToFacebook(news)
    }
}