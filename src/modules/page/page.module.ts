import { Module } from '@nestjs/common';
import { PageService } from './page.service';
import { PageController } from './page.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Page } from './page.entity';
import { Cell } from 'modules/cell/cell.entity';
import { CellService } from 'modules/cell/cell.service';
import { RowService } from 'modules/row/row.service';
import { Row } from 'modules/row/row.entity';
import { ImportModule } from 'modules/import/import.module';

@Module({
  imports: [TypeOrmModule.forFeature([Page, Cell, Row])],
  controllers: [PageController],
  providers: [PageService, CellService, RowService],
  exports: [PageService],
})
export class PageModule {}
