export interface News {
    readonly providerId: string
    readonly id: string

    readonly title: string

    readonly summary: string | null

    readonly content: string | null
}

export namespace News {
    export function create(providerId: string, id: string, title: string, summary?: string, content?: string): News {
        return {
            providerId: providerId,
            id: id,
            title: title,
            summary: summary ?? null,
            content: content ?? null,
        }
    }

    export function getGlobalId(n: News) {
        return `${n.providerId}-${n.id}`
    }
}