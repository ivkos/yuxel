import { NewsProvider } from "../../news/providers/NewsProvider"

export interface NewsProviderDto {
    id: NewsProvider["id"]
}

export namespace NewsProviderDto {
    export function from(o: NewsProvider): NewsProviderDto {
        return {
            id: o.id,
        }
    }
}