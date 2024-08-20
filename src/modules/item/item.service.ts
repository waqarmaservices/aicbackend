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

    async findOne(itemId: number): Promise<Item> {
        return this.itemRepository.findOne({ 
            where: { Item: itemId },
            select: [
                'Item',
                'DataType',
                'Object',
                'SmallInt',
                'BigInt',
                'Num',
                'Color',
                'DateTime',
                'JSON',
                'Qty',
                'Unit',
                'StdQty',
                'StdUnit',
                'Foreign'
            ]
         });
    }

    async findOneByColumnName(colName: string, colValue: string): Promise<Item> {
        return this.itemRepository.findOne({
            where: { [colName]: { 3000000100: colValue } },
        });
    }

    async updateItem(itemId: number, itemAttributes: Partial<Item>): Promise<Item> {
        // Update the item with the provided attributes
        await this.itemRepository.update(itemId, itemAttributes);
        
        // Return the updated item
        return this.itemRepository.findOne({ where: { Item: itemId } });
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

    //  Get cell Data Match Item Id Update Item Table
    async getCellAndUpdateItem(payload: any): Promise<{ updatedItem: Item; cell: Cell }> {
        // Step 1: Find the Cell entity using the cell ID from the payload
        const cellId = payload.cellId;
        const cell = await this.cellService.findOne(cellId);

        if (!cell) {
            throw new Error('Cell not found');
        }

        // Step 2: Extract the Items array from the Cell entity
        let itemsArray: number[] = [];
        if (typeof cell.Items === 'string') {
            itemsArray = (cell.Items as string)
                .replace(/[{}]/g, '') // Remove braces
                .split(',')
                .map((item) => parseInt(item.trim(), 10)); // Convert to array of numbers
        } else if (Array.isArray(cell.Items)) {
            itemsArray = cell.Items as number[];
        }
        console.log(itemsArray);

        // Step 3: Validate the itemId from the payload against the Items array
        const itemId = payload.itemId;
        if (!itemsArray.includes(itemId)) {
            throw new Error('Item ID does not exist in the Items array of the Cell');
        }

        // Step 4: Find the corresponding Item in the Items array
        const item = await this.itemRepository.findOne({ where: { Item: itemId } });

        if (!item) {
            throw new Error('Item not found');
        }

        // Step 5: Update the Item entity with the new data from the payload
        if (item.JSON && typeof item.JSON === 'object') {
            // Merge existing JSON with new key-value pair from the payload
            item.JSON = {
                ...item.JSON,
                ...payload.JSON // Add new key-value pairs from the payload
            };
        } else {
            // If the item.JSON is not an object, initialize it with the payload JSON
            item.JSON = payload.JSON;
        }

        await this.itemRepository.update(
            { Item: itemId }, // Criteria to find the item to update
            {
                DataType: payload.DataType,
                Object: payload.Object,
                SmallInt: payload.SmallInt,
                BigInt: payload.BigInt,
                Num: payload.Num,
                Color: payload.Color,
                DateTime: payload.DateTime,
                JSON: item.JSON, // Update JSON with merged data
                Qty: payload.Qty,
                Unit: payload.Unit,
                StdQty: payload.StdQty,
                StdUnit: payload.StdUnit,
                Foreign: payload.Foreign,
            }
        );

        // Step 6: Retrieve the fully updated item, selecting all required fields and relations
        const updatedItem = await this.itemRepository.findOne({
            where: { Item: itemId },
            relations: ['DataType', 'Unit', 'StdUnit'] // Include related entities
        });

        if (!updatedItem) {
            throw new Error('Updated Item not found');
        }

        // Step 7: Return the updated Item and Cell
        return {
            updatedItem,
            cell
        };
    }
}
