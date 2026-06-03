import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {TypeOrmModuleOptions, TypeOrmOptionsFactory} from '@nestjs/typeorm';

import {DATABASE_REGISTER} from './database.config';

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
    constructor(private readonly configService: ConfigService) {
    }

    createTypeOrmOptions(): TypeOrmModuleOptions {
        const databaseConfig =
            this.configService.getOrThrow<TypeOrmModuleOptions>(DATABASE_REGISTER);

        return {
            ...databaseConfig,
            autoLoadEntities: true,
        };
    }
}
