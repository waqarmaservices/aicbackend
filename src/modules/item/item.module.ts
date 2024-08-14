import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './item.entity';
import { Cell } from 'modules/cell/cell.entity';
import { CellService } from 'modules/cell/cell.service';

@Module({
  imports: [TypeOrmModule.forFeature([Item, Cell])],
  controllers: [ItemController],
  providers: [ItemService, CellService],
  exports: [ItemService],
})
export class ItemModule {}
