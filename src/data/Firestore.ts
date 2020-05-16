import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import * as admin from "firebase-admin"
import { Configuration } from "../config/Configuration"
import { ConfigKey } from "../config/ConfigKey"
import * as fs from "fs"

@Injectable()
export class Firestore implements OnModuleInit {
    private readonly logger = new Logger(Firestore.name)

    private db: FirebaseFirestore.Firestore

    constructor(private readonly config: Configuration) {}

    get() {
        return this.db
    }

    private async getFirestoreApp() {
        const fireStoreAuth = this.config.get(ConfigKey.FIRESTORE_AUTH)

        switch (fireStoreAuth) {
            case "default": {
                return admin.initializeApp({
                    credential: admin.credential.applicationDefault(),
                })
            }

            case "serverless": {
                return admin.initializeApp()
            }

            default: {
                this.logger.verbose(`Opening service account key '${fireStoreAuth}'`)

                let key
                try {
                    key = JSON.parse(await fs.promises.readFile(fireStoreAuth, "utf-8"))
                } catch (err) {
                    this.logger.error(`Could not open service account key '${fireStoreAuth}'`)
                    throw err
                }

                return admin.initializeApp({
                    credential: admin.credential.cert(key),
                })
            }
        }

    }

    async onModuleInit() {
        this.logger.verbose("Initializing Firestore app...")
        const app = await this.getFirestoreApp()

        this.db = app.firestore()
        this.logger.verbose("Firestore successfully initialized")
    }
}