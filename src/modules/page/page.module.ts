import { Module } from '@nestjs/common';
import { PageService } from './page.service';
import { PageController } from './page.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Page } from './page.entity';
import { Cell } from 'modules/cell/cell.entity';
import { CellService } from 'modules/cell/cell.service';
import { RowService } from 'modules/row/row.service';
import { Row } from 'modules/row/row.entity';
import { ItemService } from 'modules/item/item.service';
import { ColService } from 'modules/col/col.service';
import { Col } from 'modules/col/col.entity';
import { Item } from 'modules/item/item.entity';
import { Format } from 'modules/format/format.entity';
import { FormatService } from 'modules/format/format.service';

@Module({
  imports: [TypeOrmModule.forFeature([Page, Cell, Row, Col, Item, Format])],
  controllers: [PageController],
  providers: [PageService, CellService, RowService, ColService, ItemService, FormatService],
  exports: [PageService],
})
export class PageModule {}
