import { NewsProviderService } from "../providers/NewsProviderService"
import { Injectable, Logger } from "@nestjs/common"
import { NewsProvider } from "../providers/NewsProvider"
import { News } from "../News"
import * as _ from "lodash"
import { MarkovService } from "./MarkovService"
import { Firestore } from "@google-cloud/firestore"

@Injectable()
export class ScrapeService {
    private readonly logger: Logger = new Logger(ScrapeService.name)

    constructor(private readonly providerService: NewsProviderService,
                private readonly markovService: MarkovService,
                private readonly firestore: Firestore) {}

    async scrapeSingleProvider(newsProviderId: NewsProvider["id"]) {
        const provider = await this.providerService.findById(newsProviderId)
        const existingNewsIds = await this.getExistingNewsIds()
        const news = await provider.getNews(existingNewsIds)
        const filteredNews = news.filter(n => !existingNewsIds.includes(News.getGlobalId(n)))

        this.logger.log(`Adding ${news.length} news from '${provider.id}' to Firestore...`)
        await this.batchWriteNews(filteredNews)
        this.logger.log(`Successfully added '${provider.id}' news to Firestore`)

        this.logger.log(`Updating Markov cache...`)
        await this.markovService.updateMarkovCache(news)
        this.logger.log(`Successfully updated Markov cache`)
    }

    private async batchWriteNews(news: News[]) {
        if (news.length === 0) return

        const db = this.firestore
        const col = db.collection("yuxel-news")

        // Firestore allows up to 500 docs per batch
        const newsChunks = _.chunk(news, 500)
        for (const chunk of newsChunks) {
            const batch = db.batch()

            for (const n of chunk) {
                batch.set(col.doc(News.getGlobalId(n)), n, { merge: true })
            }

            await batch.commit()
        }
    }

    private async getExistingNewsIds(): Promise<News["id"][]> {
        const col = this.firestore.collection("yuxel-news")

        const existingDocRefs = await col.listDocuments()

        return existingDocRefs.map(d => d.id)
    }
}