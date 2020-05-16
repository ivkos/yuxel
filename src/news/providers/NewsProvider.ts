import { News } from "../News"

export interface NewsProvider {
    readonly id: string

    getNews(): Promise<News[]>
}
