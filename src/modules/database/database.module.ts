import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'PG_CONNECTION',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return new Pool({
          user: configService.get('DB_USERNAME'),
          host: configService.get('DB_HOST'),
          database: configService.get('DB_DATABASE'),
          password: configService.get('DB_PASSWORD'),
          port: parseInt(configService.get('DB_PORT') || '5432', 10),
        });
      },
    },
  ],
  exports: ['PG_CONNECTION'],
})
export class DatabaseModule {}
