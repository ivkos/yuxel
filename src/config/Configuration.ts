import { ConfigKey } from "./ConfigKey"

export type ConfigKeyType = string | ConfigKey

export abstract class Configuration {
    abstract get<T = any>(key: string | ConfigKey): T

    abstract set<T = any>(key: string | ConfigKey, value: T): T
}
