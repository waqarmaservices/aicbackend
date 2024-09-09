import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './item.entity';
import { Cell } from 'modules/cell/cell.entity';
import { CellService } from 'modules/cell/cell.service';
import { FormatService } from 'modules/format/format.service';
import { Format } from 'modules/format/format.entity';
import { PageService } from 'modules/page/page.service';
import { Page } from 'modules/page/page.entity';
import { RowService } from 'modules/row/row.service';
import { Row } from 'modules/row/row.entity';
import { ColService } from 'modules/col/col.service';
import { Col } from 'modules/col/col.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Item, Cell, Format, Page, Row, Col])],
  controllers: [ItemController],
  providers: [ItemService, CellService, FormatService, PageService, RowService, ColService],
  exports: [ItemService],
})
export class ItemModule {}
