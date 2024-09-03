import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './item.entity';
import { Cell } from 'modules/cell/cell.entity';
import { CellService } from 'modules/cell/cell.service';
import { FormatService } from 'modules/format/format.service';
import { Format } from 'modules/format/format.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Item, Cell, Format])],
  controllers: [ItemController],
  providers: [ItemService, CellService, FormatService],
  exports: [ItemService],
})
export class ItemModule {}
