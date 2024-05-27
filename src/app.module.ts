import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { typeOrmAsyncConfig } from './config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { PageModule } from './modules/page/page.module';
import { ColModule } from './modules/col/col.module';
import { RowModule } from './modules/row/row.module';
import { CellModule } from './modules/cell/cell.module';
import { ItemModule } from './modules/item/item.module';
import { FormatModule } from './modules/format/format.module';
import { TxModule } from './modules/tx/tx.module';
import { UserModule } from './modules/user/user.module';
import { CellController } from './modules/cell/cell.controller';
import { RowController } from './modules/row/row.controller';
import { ItemController } from './modules/item/item.controller';
import { PageController } from './modules/page/page.controller';
import { FormatController } from './modules/format/format.controller';
import { UserController } from './modules/user/user.controller';
import { TxController } from './modules/tx/tx.controller';
import { ColController } from './modules/col/col.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [appConfig],
        }),
        TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
        CacheModule.register(),
        AuthModule,
        PageModule,
        ColModule,
        RowModule,
        CellModule,
        ItemModule,
        FormatModule,
        TxModule,
        UserModule,
    ],
    controllers: [
        AppController,
        CellController,
        RowController,
        ItemController,
        TxController,
        UserController,
        FormatController,
        PageController,
        ColController,
    ],
    providers: [
        AppService,
        {
            provide: APP_INTERCEPTOR,
            useClass: CacheInterceptor,
        },
    ],
})
export class AppModule {}
