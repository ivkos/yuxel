import { News } from "../News"

export interface NewsProvider {
    readonly id: string

    getNews(existingNewsIds: News["id"][]): Promise<News[]>
}
