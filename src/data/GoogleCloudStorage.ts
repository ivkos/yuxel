import { Configuration } from "../config/Configuration"
import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { Storage } from "@google-cloud/storage"
import { ConfigKey } from "../config/ConfigKey"
import * as fs from "fs"

@Injectable()
export class GoogleCloudStorage implements OnModuleInit {
    private readonly logger = new Logger(GoogleCloudStorage.name)

    private storage: Storage

    constructor(private readonly config: Configuration) {}

    get(): Storage {
        return this.storage
    }

    private async getStorage() {
        const storageAuth = this.config.get(ConfigKey.GCP_STORAGE_AUTH)

        switch (storageAuth) {
            case "default": {
                return new Storage()
            }

            default: {
                this.logger.verbose(`Opening service account key '${storageAuth}'`)

                let key
                try {
                    key = JSON.parse(await fs.promises.readFile(storageAuth, "utf-8"))
                } catch (err) {
                    this.logger.error(`Could not open service account key '${storageAuth}'`)
                    throw err
                }

                return new Storage({
                    credentials: key,
                })
            }
        }
    }


    async onModuleInit() {
        this.logger.verbose("Initializing Google Cloud Storage...")
        this.storage = await this.getStorage()
        this.logger.verbose("Google Cloud Storage successfully initialized")
    }

}