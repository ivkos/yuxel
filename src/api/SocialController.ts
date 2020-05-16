import { Controller, Post } from "@nestjs/common"
import axios from "axios"
import { Configuration } from "../config/Configuration"
import { ConfigKey } from "../config/ConfigKey"
import { NewsService } from "../news/NewsService"


@Controller("/social")
export class SocialController {
    constructor(private readonly config: Configuration,
                private readonly newsService: NewsService) {}

    @Post("/")
    async post() {
        const news = await this.newsService.getNews()

        await axios.post(
            this.config.get(ConfigKey.SOCIAL_FACEBOOK_WEBHOOK_URL),
            {
                value1: news.title,
                value2: news.summary,
                value3: null,
            },
        )
    }
}