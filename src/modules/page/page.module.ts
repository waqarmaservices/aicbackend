import { Module } from '@nestjs/common';
import { PageService } from './page.service';
import { PageController } from './page.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Page } from './page.entity';
import { PageGateway } from './page.gateway';
import { Col } from 'modules/col/col.entity';
import { Cell } from 'modules/cell/cell.entity';
import { CellService } from 'modules/cell/cell.service';

@Module({
  imports: [TypeOrmModule.forFeature([Page,Cell])],
  controllers: [PageController],
  providers: [PageService, CellService],
  exports: [PageService],
})
export class PageModule {}
