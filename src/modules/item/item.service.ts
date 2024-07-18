import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Item } from './item.entity';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  async createItem(payload: any): Promise<Item> {
    const itemData = this.itemRepository.create(payload as Partial<Item>);
    return this.itemRepository.save(itemData);
  }

  async findAll(): Promise<Item[]> {
    return this.itemRepository.find();
  }

  async findOne(id: number): Promise<Item> {
    return this.itemRepository.findOne({ where: { Item: id } });
  }

  async findOneByColumnName(colName: string, colValue: string): Promise<Item> {
    return this.itemRepository.findOne({
      where: { [colName]: { 3000000100: colValue } },
    });
  }

  async updateItem(id: number, updateData: Partial<Item>): Promise<Item> {
    await this.itemRepository.update(id, updateData);
    return this.findOne(id);
  }

  async deleteItem(id: number): Promise<void> {
    await this.itemRepository.delete(id);
  }

  async updateItemsByItems(Items: number[], updateData: Partial<Item>): Promise<void> {
    await this.itemRepository
      .createQueryBuilder()
      .update(Item)
      .set(updateData)
      .where('Item IN (:...Item)', { Item: Items })
      .execute();
  }
}
