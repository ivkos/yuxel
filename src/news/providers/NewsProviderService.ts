import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common"
import { EnabledNewsProviders } from "./EnabledNewsProviders"
import { NewsProvider } from "./NewsProvider"
import { Configuration } from "../../config/Configuration"
import { ModuleRef } from "@nestjs/core"

@Injectable()
export class NewsProviderService implements OnModuleInit {
    private newsProviders: { [key: string]: NewsProvider }

    constructor(private readonly config: Configuration,
                private readonly moduleRef: ModuleRef) {}

    onModuleInit() {
        this.newsProviders = Object.fromEntries(EnabledNewsProviders.map(clazz => {
            const instance = this.moduleRef.get(clazz, { strict: false })
            return [instance.id, instance]
        }))
    }

    async findAll() {
        return Object.values(this.newsProviders)
    }

    async findById(newsProviderId: string) {
        const provider = this.newsProviders[newsProviderId]

        if (provider === undefined) {
            throw new NotFoundException("News provider not found")
        }

        return provider
    }
}