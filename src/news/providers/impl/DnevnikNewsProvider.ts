import { NewsProvider } from "../NewsProvider"
import { News } from "../../News"
import axios from "axios"
import * as cheerio from "cheerio"
import { Injectable, Logger } from "@nestjs/common"

@Injectable()
export class DnevnikNewsProvider implements NewsProvider {
    private static readonly HARD_LIMIT = 1500
    private readonly logger = new Logger(DnevnikNewsProvider.name)

    readonly id: string = "dnevnik.bg"

    async getNews(): Promise<News[]> {
        const news = []

        for (let offset = 0; offset < DnevnikNewsProvider.HARD_LIMIT;) {
            try {
                const result = await this.fetchNews(offset)
                offset += result.length
                news.push(...result)

                this.logger.verbose(`Got ${result.length} news`)
            } catch (err) {
                this.logger.warn("Failed to fetch news")
                this.logger.warn(err)

                break
            }
        }

        return news
    }

    private async fetchNews(offset = 0) {
        let response
        try {
            response = await axios.get(
                `https://www.dnevnik.bg/ajax/section/allnews/${offset}/12/list`,
                {
                    headers: {
                        "X-Requested-With": "XMLHttpRequest",
                    },
                })
        } catch (err) {
            this.logger.error("Failed to fetch response")
            this.logger.error(response)
            throw err
        }

        const $ = cheerio.load(response.data)
        const newsArticles = $("article")

        return newsArticles
            .map((_, elem) => this.mapNewsElement($, elem))
            .get()
    }

    private mapNewsElement($: CheerioStatic, elem: CheerioElement): News {
        const href = $("div.text h2 a", elem).prop("href")
        if (!href) throw new Error("Could not parse href")
        const url = "https://www.dnevnik.bg" + href

        const title = $("div.text h2", elem).text()
        if (!title) throw new Error("Could not parse title or summary")

        const summary = $("div.text p", elem).text() || undefined

        const dateStr = $("div.text div.article-tools time", elem).prop("datetime")
        if (!dateStr) throw new Error("Could not parse datetime")
        const date = new Date(dateStr)

        const id = url.match(/\/(\d+)_/)[1]
        if (!id) throw new Error("Could not parse id")

        return News.create(
            this.id,
            id,
            title,
            summary,
        )
    }
}