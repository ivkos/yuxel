import { ConfigKeyType, Configuration } from "./Configuration"
import * as fs from "fs"
import * as YAML from "yaml"
import * as nconf from "nconf"

export class EnvYamlConfiguration extends Configuration {
    static readonly DEFAULT_CONFIG_FILE_PATH = "config.yaml"

    constructor(private readonly filePath: string = EnvYamlConfiguration.DEFAULT_CONFIG_FILE_PATH) {
        super()

        const content = fs.readFileSync(filePath, "utf-8")
        const obj = YAML.parse(content)

        nconf.env({ parseValues: true }).defaults(obj)
    }

    get<T = any>(key: ConfigKeyType): T {
        return nconf.get(key)
    }

    set<T = any>(key: ConfigKeyType, value: T): T {
        return nconf.set(key, value)
    }
}
