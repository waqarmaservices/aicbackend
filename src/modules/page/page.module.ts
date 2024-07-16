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
import { ColService } from 'modules/col/col.service';
import { Col } from 'modules/col/col.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Page, Cell, Row, Col])],
  controllers: [PageController],
  providers: [PageService, CellService, RowService, ColService],
  exports: [PageService],
})
export class PageModule {}
