import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Item } from './item.entity';
import { CellService } from 'modules/cell/cell.service';
import { Cell } from 'modules/cell/cell.entity';

@Injectable()
export class ItemService {
    constructor(
        @InjectRepository(Item)
        private readonly itemRepository: Repository<Item>,
        private readonly cellService: CellService,
    ) { }

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
    async deleteItem(id: number): Promise<any | null> {
        // Fetch the page to get the Pg value before deletion
        const Item = await this.itemRepository.findOne({ where: { Item: id } });

        if (!Item) {
            return null;  // Return null if the page does not exist
        }

        // Delete the page by its ID
        await this.itemRepository.delete(id);

        // Return the Pg value of the deleted page
        return Item.Item;
    }
    async updateItemsByItems(Items: number[], updateData: Partial<Item>): Promise<void> {
        await this.itemRepository
            .createQueryBuilder()
            .update(Item)
            .set(updateData)
            .where('Item IN (:...Item)', { Item: Items })
            .execute();
    }

    async getItemsByIds(itemIds: number[]): Promise<Item[]> {
        return await this.itemRepository.find({
            where: { Item: In(itemIds) },
            relations: ['ItemObject.cells'],
        });
    }

    // Create Item table with Updation of Cell

    async createItemAndUpdateCell(payload: any): Promise<{ createdItem: Item; updatedCell: Cell }> {

        // Step 1: Create the Item entity
        const createdItem = await this.itemRepository.save({
            DataType: payload.DataType,
            Object: payload.Object,
            SmallInt: payload.SmallInt,
            BigInt: payload.BigInt,
            Num: payload.Num,
            Color: payload.Color,
            DateTime: payload.DateTime,
            JSON: payload.JSON,
            Qty: payload.Qty,
            Unit: payload.Unit,
            StdQty: payload.StdQty,
            StdUnit: payload.StdUnit,
            Foreign: payload.Foreign,
        });

        // Step 2: Find the Cell entity using the cell ID from the payload
        const cellId = payload.cellId;
        const cell = await this.cellService.findOne(cellId);

        if (!cell) {
            throw new Error('Cell not found');
        }

        // Step 3: Ensure cell.Items is handled correctly based on its type
        let itemsArray: number[] = [];

        if (typeof cell.Items === 'string') {
            itemsArray = (cell.Items as string).replace(/[{}]/g, '') // Remove braces
                .split(',')
                .map((item) => parseInt(item.trim(), 10)); // Convert to array of numbers
        } else if (Array.isArray(cell.Items)) {
            itemsArray = cell.Items as number[];
        }

        // Step 4: Add the new item ID to the list
        itemsArray.push(createdItem.Item);

        // Step 5: Convert the updated array back to the format needed by your database
        const updatedItemsString = `{${itemsArray.join(',')}}`;

        // Step 6: Update the Cell with the new Items array
        const updatedCell = await this.cellService.updateCell(cell.Cell, { Items: updatedItemsString });

        // Return the created item and the updated cell
        return { createdItem, updatedCell };
    }
}
