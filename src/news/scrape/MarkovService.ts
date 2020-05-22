import { Injectable } from "@nestjs/common"
import { News } from "../News"
import * as _ from "lodash"
import { NewsProvider } from "../providers/NewsProvider"
import { GoogleCloudStorage } from "../../data/GoogleCloudStorage"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Markovski = require("markovski")

type ModelType = "title" | "summary"

@Injectable()
export class MarkovService {

    constructor(private readonly storage: GoogleCloudStorage) {}

    async updateMarkovCache(news: News[]) {
        const globalTitle = await this.getBundle("title")
        const globalSummary = await this.getBundle("summary")

        const grouped = _.groupBy(news, n => n.providerId)
        for (const [providerId, news] of Object.entries(grouped)) {
            const title = await this.getBundle("title", providerId)
            const summary = await this.getBundle("summary", providerId)

            for (const n of news) {
                globalTitle.markovski.train(n.title)
                title.markovski.train(n.title)

                summary.markovski.train(n.summary)
                globalSummary.markovski.train(n.summary)
            }

            await title.fileRef.save(JSON.stringify(title.markovski.getModel()))
            await summary.fileRef.save(JSON.stringify(summary.markovski.getModel()))
        }

        await globalTitle.fileRef.save(JSON.stringify(globalTitle.markovski.getModel()))
        await globalSummary.fileRef.save(JSON.stringify(globalSummary.markovski.getModel()))
    }

    async getBundle(modelType: ModelType, providerId: NewsProvider["id"] = undefined) {
        let documentName = ""
        if (providerId !== undefined) {
            documentName += `${providerId}-`
        }
        documentName += modelType

        const fileRef = this.storage.get()
            .bucket("yuxel")
            .file(`cache-markovski/${documentName}.json`)

        let model

        const [exists] = await fileRef.exists()
        if (exists) {
            const [buf] = await fileRef.download()
            model = JSON.parse(buf.toString("utf-8"))
        }

        let markovski
        switch (modelType) {
            case "title":
                markovski = this.createForTitle(model)
                break
            case "summary":
                markovski = this.createForSummary(model)
                break
            default:
                throw new Error(`Unknown ModelType: '${modelType}'`)
        }

        return {
            fileRef: fileRef,
            model: model,
            markovski: markovski,
        }
    }

    createForTitle(model: object = undefined) {
        return this.createMarkovski(15, model)
    }


    createForSummary(model: object = undefined) {
        return this.createMarkovski(25, model)
    }

    createMarkovski(wordCount: number, model: object = undefined) {
        const singlePunctuation = new RegExp(/^[,.;:!?\(\)]$/)

        const m = new Markovski(2, true)
            .lowerCaseModelKeys(true)
            .wordNormalizer((word: string) => word.replace(/[.,!?]+$/ig, ""))
            .sentenceToWordsSplitter((sentence: string) => sentence
                .split(/\s/)
                .map(w => w.trim())
                .filter(w => w.length > 0)
                .filter(w => !singlePunctuation.test(w)))
            .endWhen(wordCount)

        if (model !== undefined) {
            m.withModel(model)
        }

        return m
    }
}