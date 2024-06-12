import { ConfigModule, ConfigService } from '@nestjs/config';
import {
    TypeOrmModuleAsyncOptions,
    TypeOrmModuleOptions,
} from '@nestjs/typeorm';

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (): Promise<TypeOrmModuleOptions> => {
        return {
            type: 'postgres',
            host: process.env.DB_HOST || '34.170.214.166',
            port: parseInt(process.env.DB_PORT, 10) || 5432,
            database: process.env.DB_DATABASE || 'aic-dev',
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || '1Cx4_>~MHy0ezB$l',
            entities: [__dirname + '/../**/*.entity.{js,ts}'],
            synchronize: false,
            logging: true,
        };
    },
};
