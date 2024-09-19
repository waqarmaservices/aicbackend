import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { PageService } from '../page/page.service';
import { RowService } from '../row/row.service';
import { ColService } from '../col/col.service';
import { CellService } from '../cell/cell.service';
import { ItemService } from '../item/item.service';
import { FormatService } from '../format/format.service';
import { UserService } from '../user/user.service';
import { Page } from '../page/page.entity';
import { Row } from '../row/row.entity';
import { Col } from '../col/col.entity';
import { Cell } from '../cell/cell.entity';
import { Item } from '../item/item.entity';
import { Format } from '../format/format.entity';
import { User } from '../user/user.entity';
import { Pool } from 'pg';
import { DatabaseModule } from 'modules/database/database.module';

@Module({
  imports: [TypeOrmModule.forFeature([Page, Row, Col, Cell, Item, Format, User]), Pool, DatabaseModule],
  controllers: [ImportController],
  providers: [ImportService, PageService, RowService, ColService, CellService, ItemService, FormatService, UserService],
})
export class ImportModule {}
