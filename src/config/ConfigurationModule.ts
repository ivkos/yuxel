import { Module } from "@nestjs/common"
import { Configuration } from "./Configuration"
import { EnvYamlConfiguration } from "./EnvYamlConfiguration"

@Module({
    providers: [
        { provide: Configuration, useFactory: () => new EnvYamlConfiguration() },
    ],
    exports: [Configuration],
})
export class ConfigurationModule {}
