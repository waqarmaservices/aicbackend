import { Module } from '@nestjs/common';
import { ColService } from './col.service';
import { ColController } from './col.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Col } from './col.entity';
import { Format } from 'modules/format/format.entity';
import { FormatService } from 'modules/format/format.service';
import { Row } from 'modules/row/row.entity';
import { Page } from 'modules/page/page.entity';
import { PageService } from 'modules/page/page.service';
import { RowService } from 'modules/row/row.service';
import { CellService } from 'modules/cell/cell.service';
import { Cell } from 'modules/cell/cell.entity';
import { Item } from 'modules/item/item.entity';
import { ItemService } from 'modules/item/item.service';

@Module({
  imports: [TypeOrmModule.forFeature([Col, Format, Row, Page, Cell, Item])],
  controllers: [ColController],
  providers: [ColService, FormatService, RowService, PageService, CellService, ItemService],
  exports: [ColService],
})
export class ColModule {}
