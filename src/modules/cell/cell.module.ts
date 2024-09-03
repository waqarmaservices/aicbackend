import { Module } from '@nestjs/common';
import { CellService } from './cell.service';
import { CellController } from './cell.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cell } from './cell.entity';
import { Format } from 'modules/format/format.entity';
import { FormatService } from 'modules/format/format.service';
import { Item } from 'modules/item/item.entity';
import { ItemService } from 'modules/item/item.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cell, Format, Item])],
  controllers: [CellController],
  providers: [CellService, FormatService, ItemService],
  exports: [CellService],
})
export class CellModule {}
