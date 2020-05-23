import { Injectable } from "@nestjs/common"
import { News } from "../News"
import * as _ from "lodash"
import { NewsProvider } from "../providers/NewsProvider"
import { Storage } from "@google-cloud/storage"
import { Configuration } from "../../config/Configuration"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Markovski = require("markovski")

type ModelType = "title" | "summary"

@Injectable()
export class MarkovService {
    private static readonly CACHE_DIRECTORY = "cache-markovski"
    private modelCache: { [key: string]: { model: object, modelUpdatedAt: Date } } = {}

    constructor(private readonly storage: Storage,
                private readonly config: Configuration) {}

    async updateMarkovCache(news: News[]) {
        if (news.length === 0) return

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
            await title.cache(title.markovski.getModel(), new Date())

            await summary.fileRef.save(JSON.stringify(summary.markovski.getModel()))
            await summary.cache(summary.markovski.getModel(), new Date())
        }

        await globalTitle.fileRef.save(JSON.stringify(globalTitle.markovski.getModel()))
        globalTitle.cache(globalTitle.markovski.getModel(), new Date())

        await globalSummary.fileRef.save(JSON.stringify(globalSummary.markovski.getModel()))
        globalSummary.cache(globalSummary.markovski.getModel(), new Date())
    }

    async getBundle(modelType: ModelType, providerId: NewsProvider["id"] = undefined) {
        let documentName = ""
        if (providerId !== undefined) {
            documentName += `${providerId}-`
        }
        documentName += modelType

        const fileRef = this.storage
            .bucket(this.config.get("DATA_STORAGE_CONTAINER"))
            .file(`${MarkovService.CACHE_DIRECTORY}/${documentName}.json`)

        let model
        let modelUpdatedAt

        const [exists] = await fileRef.exists()
        if (exists) {
            modelUpdatedAt = new Date(fileRef.metadata.updated)

            const cachedModel = this.modelCache[documentName]
            if (!cachedModel || cachedModel.modelUpdatedAt < modelUpdatedAt) {
                const [buf] = await fileRef.download()
                model = JSON.parse(buf.toString("utf-8"))

                this.modelCache[documentName] = { model: model, modelUpdatedAt: modelUpdatedAt }
            } else {
                model = cachedModel.model
            }
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
            modelUpdatedAt: modelUpdatedAt,
            cache: (model: object, modelUpdatedAt: Date) => {
                this.modelCache[documentName] = {
                    model: model,
                    modelUpdatedAt: modelUpdatedAt,
                }
            },
            markovski: markovski,
        }
    }

    async dropCache() {
        await this.storage
            .bucket(this.config.get("DATA_STORAGE_CONTAINER"))
            .deleteFiles({ directory: MarkovService.CACHE_DIRECTORY })

        this.modelCache = {}
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