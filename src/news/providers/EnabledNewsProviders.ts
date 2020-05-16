import { DnevnikNewsProvider } from "./impl/DnevnikNewsProvider"
import { Type } from "@nestjs/common"
import { NewsProvider } from "./NewsProvider"

export const EnabledNewsProviders: Type<NewsProvider>[] = [
    DnevnikNewsProvider,
]
