import { Injectable } from "@nestjs/common"
import { Configuration } from "../config/Configuration"
import axios from "axios"
import { GeneratedNews } from "../api/dto/GeneratedNews"


@Injectable()
export class SocialService {
    constructor(private readonly config: Configuration) {}

    async postToFacebook(news: GeneratedNews) {
        const content = `🔔 ${news.title}\n\n` +
            `ℹ ${news.summary}\n\n` +
            "🕘 Очаквайте подробности в емисията ни след 1 час."

        await this.publishPostOnFacebookPage(content)
    }

    private async publishPostOnFacebookPage(content: string): Promise<void> {
        const pageId = this.config.get<string>("SOCIAL_FACEBOOK_PAGE_ID")
        const pageAccessToken = this.config.get<string>("SOCIAL_FACEBOOK_PAGE_ACCESS_TOKEN")

        await axios.post(
            `https://graph.facebook.com/${pageId}/feed` +
            `?message=${encodeURIComponent(content)}` +
            `&access_token=${pageAccessToken}`,
        )
    }

    private async publishPhotoOnFacebookPage(imageUrl: string): Promise<void> {
        const pageId = this.config.get<string>("SOCIAL_FACEBOOK_PAGE_ID")
        const pageAccessToken = this.config.get<string>("SOCIAL_FACEBOOK_PAGE_ACCESS_TOKEN")

        await axios.post(
            `https://graph.facebook.com/${pageId}/photos` +
            `?url=${encodeURIComponent(imageUrl)}` +
            `&access_token=${pageAccessToken}`,
        )
    }
}