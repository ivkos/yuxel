import { NewsProvider } from "../NewsProvider"
import { News } from "../../News"
import axios from "axios"
import * as cheerio from "cheerio"
import { Injectable, Logger } from "@nestjs/common"
import { DateTime, Duration, Interval } from "luxon"
import pLimit from "p-limit"


@Injectable()
export class DnevnikNewsProvider implements NewsProvider {
    private static readonly CONCURRENCY: number = 3

    private readonly logger = new Logger(DnevnikNewsProvider.name)

    readonly id: string = "dnevnik.bg"

    async getNews(existingNewsIds: News["id"][]): Promise<News[]> {
        const news = []

        const today = DateTime.local().setZone("Europe/Sofia").startOf("day")
        const oneDay = Duration.fromObject({ day: 1 })
        const interval = Interval.before(today, { month: 1 })

        const limit = pLimit(DnevnikNewsProvider.CONCURRENCY)
        const promises = []

        for (let day = today.minus(oneDay); interval.contains(day); day = day.minus(oneDay)) {
            promises.push(limit(async () => {
                const dayString = day.toFormat("yyyy/LL/dd")
                this.logger.verbose(`Getting ${dayString}`)

                const result = await this.fetchNewsOfDay(dayString)
                const filteredResult = result.filter(n => !existingNewsIds.includes(News.getGlobalId(n)))
                news.push(...filteredResult)

                this.logger.verbose(`Got ${result.length} news, after filtering ${filteredResult.length} news`)
            }))
        }

        try {
            await Promise.all(promises)
        } catch (err) {
            this.logger.warn("Failed to fetch news")
            this.logger.warn(err)
        }

        return news
    }

    private async fetchNewsOfDay(dayString: string) {
        let response
        try {
            response = await axios.get(
                `https://www.dnevnik.bg/allnews/${dayString}/allnews/`,
                {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36",
                    },
                },
            )
        } catch (err) {
            this.logger.error("Failed to fetch response")
            this.logger.error(response)
            throw err
        }

        const $ = cheerio.load(response.data)
        const articles = $("article.list-item")

        return articles
            .map((_, elem) => this.mapNewsElement($, elem))
            .get()
            .filter(it => it !== null)
    }

    private mapNewsElement($: CheerioStatic, elem: CheerioElement): News | null {
        const isAd = $("div.text p.special-project-adv", elem).length !== 0
        if (isAd) return null

        const href = $("div.text h2 a", elem).prop("href")
        if (!href) throw new Error("Could not parse href")
        const url = "https://www.dnevnik.bg" + href

        const title = $("div.text h2", elem).text()
        if (!title) throw new Error("Could not parse title or summary")

        const summary = $("div.text p:last-of-type", elem).text() || undefined

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