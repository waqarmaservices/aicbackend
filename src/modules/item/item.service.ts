import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  async createItem(payload: any): Promise<any> {
    const itemData = this.itemRepository.create(payload);
    return this.itemRepository.save(itemData);
  }

  async findAll(): Promise<any> {
    return this.itemRepository.find();
  }

  async findOne(id: number): Promise<Item> {
    return this.itemRepository.findOne({ where: { Item: id } });
  }

  async updateItem(id: number, updateData: Partial<Item>): Promise<Item> {
    await this.itemRepository.update(id, updateData);
    return this.findOne(id);
  }

  async deleteItem(id: number): Promise<void> {
    await this.itemRepository.delete(id);
  }
}
