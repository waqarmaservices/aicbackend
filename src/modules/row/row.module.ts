import { Module } from '@nestjs/common';
import { RowService } from './row.service';
import { RowController } from './row.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Row } from './row.entity';
import { PageService } from '../../modules/page/page.service';
import { Col } from 'modules/col/col.entity';
import { Cell } from 'modules/cell/cell.entity';
import { Item } from 'modules/item/item.entity';
import { Format } from 'modules/format/format.entity';
import { User } from 'modules/user/user.entity';
import { CellService } from 'modules/cell/cell.service';
import { Page } from 'modules/page/page.entity';
import { ColService } from 'modules/col/col.service';
import { ItemService } from 'modules/item/item.service';
import { FormatService } from 'modules/format/format.service';
import { UserService } from 'modules/user/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([Row, Page, Cell, Col, Item, Format, User])],
  controllers: [RowController],
  providers: [RowService, PageService, CellService, ColService, ItemService, FormatService, UserService],
  exports: [RowService],
})
export class RowModule {}
