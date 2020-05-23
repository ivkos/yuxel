import { Module } from "@nestjs/common"
import { Configuration } from "../config/Configuration"
import { ConfigurationModule } from "../config/ConfigurationModule"
import { ConfigKey } from "../config/ConfigKey"
import * as admin from "firebase-admin"
import { Firestore } from "@google-cloud/firestore"
import App = admin.app.App

@Module({
    imports: [ConfigurationModule],
    providers: [{
        provide: Firestore,
        inject: [Configuration],
        useFactory: (config: Configuration) => {
            const fireStoreAuth = config.get(ConfigKey.GCP_FIRESTORE_AUTH)

            let app: App
            if (fireStoreAuth === "default") {
                app = admin.initializeApp({ credential: admin.credential.applicationDefault() })
            } else if (fireStoreAuth === "serverless") {
                app = admin.initializeApp()
            } else {
                app = admin.initializeApp({ credential: admin.credential.cert(fireStoreAuth) })
            }

            return app.firestore()
        },
    }],
    exports: [Firestore],
})
export class FirestoreModule {}