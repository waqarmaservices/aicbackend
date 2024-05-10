import { Module } from '@nestjs/common';
import { PageService } from './page.service';
import { PageController } from './page.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Page } from './page.entity';
import { PageGateway } from './page.gateway';
@Module({
    imports: [TypeOrmModule.forFeature([Page])],
    controllers: [PageController],
    providers: [PageService, PageGateway],
})
export class PageModule {}
