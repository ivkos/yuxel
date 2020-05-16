import { NestFactory } from "@nestjs/core"
import { ApplicationModule } from "./ApplicationModule"
import { Configuration } from "./config/Configuration"
import { ConfigKey } from "./config/ConfigKey"

async function bootstrap() {
    const app = await NestFactory.create(ApplicationModule)
    app.enableCors()

    const config = app.get(Configuration)
    await app.listen(config.get(ConfigKey.PORT))
}

bootstrap()
