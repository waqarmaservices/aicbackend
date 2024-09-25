import { Module } from '@nestjs/common';
import { FormatService } from './format.service';
import { FormatController } from './format.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Format } from './format.entity';
import { Page } from 'modules/page/page.entity';
import { PageService } from 'modules/page/page.service';
import { CellService } from 'modules/cell/cell.service';
import { Cell } from 'modules/cell/cell.entity';
import { RowService } from 'modules/row/row.service';
import { Row } from 'modules/row/row.entity';
import { ItemService } from 'modules/item/item.service';
import { Item } from 'modules/item/item.entity';
import { ColService } from 'modules/col/col.service';
import { Col } from 'modules/col/col.entity';
import { Pool } from 'pg';
import { DatabaseModule } from 'modules/database/database.module';

@Module({
  imports: [TypeOrmModule.forFeature([Format, Page, Cell, Row, Item, Col]), Pool, DatabaseModule],
  controllers: [FormatController],
  providers: [FormatService, PageService, CellService, RowService, ItemService, ColService],
  exports: [FormatService],
})
export class FormatModule {}
