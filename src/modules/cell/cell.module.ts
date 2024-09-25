import { Module } from '@nestjs/common';
import { CellService } from './cell.service';
import { CellController } from './cell.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cell } from './cell.entity';
import { Format } from 'modules/format/format.entity';
import { FormatService } from 'modules/format/format.service';
import { Item } from 'modules/item/item.entity';
import { ItemService } from 'modules/item/item.service';
import { PageService } from 'modules/page/page.service';
import { Page } from 'modules/page/page.entity';
import { RowService } from 'modules/row/row.service';
import { Row } from 'modules/row/row.entity';
import { ColService } from 'modules/col/col.service';
import { Col } from 'modules/col/col.entity';
import { Pool } from 'pg';
import { DatabaseModule } from 'modules/database/database.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cell, Format, Item, Page, Row, Col]), Pool, DatabaseModule],
  controllers: [CellController],
  providers: [CellService, FormatService, ItemService, PageService, RowService, ColService],
  exports: [CellService],
})
export class CellModule {}
