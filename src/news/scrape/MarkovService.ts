import { Injectable } from "@nestjs/common"
import { Firestore } from "../../data/Firestore"
import { News } from "../News"
import * as _ from "lodash"
import { NewsProvider } from "../providers/NewsProvider"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Markovski = require("markovski")

type ModelType = "title" | "summary"

@Injectable()
export class MarkovService {

    constructor(readonly store: Firestore) {}

    async updateMarkovCache(news: News[]) {
        const col = this.store.get().collection("yuxel-cache-markovski")

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

            await title.docRef.set({ model: title.markovski.getModel() })
            await summary.docRef.set({ model: summary.markovski.getModel() })
        }

        await globalTitle.docRef.set({ model: globalTitle.markovski.getModel() })
        await globalSummary.docRef.set({ model: globalSummary.markovski.getModel() })
    }

    async getBundle(modelType: ModelType, providerId: NewsProvider["id"] = undefined) {
        const col = this.store.get().collection("yuxel-cache-markovski")

        let documentName = ""
        if (providerId !== undefined) {
            documentName += `${providerId}-`
        }
        documentName += modelType

        const docRef = col.doc(documentName)
        const docSnapshot = await docRef.get()
        const model = docSnapshot.data()?.model

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
            docRef: docRef,
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