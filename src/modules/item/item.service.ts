import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Item } from './item.entity';
import { CellService } from 'modules/cell/cell.service';
import { Cell } from 'modules/cell/cell.entity';
import { RowService } from 'modules/row/row.service';
import { PageService } from 'modules/page/page.service';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @Inject(forwardRef(() => CellService))
    private readonly cellService: CellService,
    @Inject(forwardRef(() => RowService))
    private readonly rowService: RowService,
    @Inject(forwardRef(() => PageService))
    private readonly pageService: PageService,
  ) {}

  async createItem(payload: any): Promise<Item> {
    const itemData = this.itemRepository.create(payload as Partial<Item>);
    return this.itemRepository.save(itemData);
  }
  async findAll(): Promise<Item[]> {
    return this.itemRepository.find();
  }
  async findOne(Id: number): Promise<Item> {
    return this.itemRepository.findOne({
      where: { Item: Id },
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
        'Foreign',
      ],
    });
  }
  async findOneByColumnName(colName: string, colValue: string): Promise<Item> {
    return this.itemRepository.findOne({
      where: { [colName]: { 3000000100: colValue } },
    });
  }
  async updateItem(id: number, itemAttributes: Partial<Item>): Promise<Item> {
    // Update the item with the provided attributes
    await this.itemRepository.update(id, itemAttributes);

    // Return the updated item
    return this.itemRepository.findOne({ where: { Item: id } });
  }
  async deleteItem(id: number): Promise<any | null> {
    // Fetch the page to get the Pg value before deletion
    const Item = await this.itemRepository.findOne({ where: { Item: id } });

    if (!Item) {
      return null; // Return null if the page does not exist
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
      relations: ['ItemObject.cells', 'DataType'],
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

    // Step 2: Find the Cell entity using colId and rowId from the payload
    const colId = payload.colId;
    const rowId = payload.rowId;

    const cell = await this.cellService.findCellByColAndRow(colId, rowId);
    if (!cell) {
      throw new Error('Cell not found');
    }
    const row = await this.rowService.findOne(rowId);
    // Step 3: Ensure cell.Items is handled correctly based on its type
    let itemsArray: number[] = [];
    if (typeof cell.Items === 'string') {
      itemsArray = (cell.Items as string)
        .replace(/[{}]/g, '') // Remove braces
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

    //  step: 7 Clear cache for the page
    const clean = await this.pageService.clearPageCache(row.Pg.Pg.toString()); // Clear cache for this page
    console.log(clean);

    //step: 8 Return the created item and the updated cell
    return { createdItem, updatedCell };
  }
  //  Get cell Data Match Item Id Update Item Table
  async getCellAndUpdateItem(payload: any): Promise<{ updatedItem: Item; cell: Cell }> {
    // Extract data from payload
    const colId = payload.colId;
    const rowId = payload.rowId;
    const pageId = payload.PageId; // PageId from payload
  
    // Step 1: Find the Cell entity using colId and rowId from the payload
    const cell = await this.cellService.findCellByColAndRow(colId, rowId);
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
  
    // Step 3: Check that exactly one item exists in the Items array
    if (itemsArray.length !== 1) {
      throw new Error('Expected exactly one Item ID in the Items array, found: ' + itemsArray.length);
    }
  
    // Step 4: Use the single itemId from the Items array
    const itemId = itemsArray[0];
  
    // Step 5: Find the corresponding Item in the database
    const item = await this.itemRepository.findOne({ where: { Item: itemId } });
    if (!item) {
      throw new Error('Item not found');
    }
  
    // Step 6: Update the Item entity with new data from the payload
    if (item.JSON && typeof item.JSON === 'object') {
      item.JSON = {
        ...item.JSON,
        ...payload.JSON, // Add new key-value pairs from the payload
      };
    } else {
      item.JSON = payload.JSON; // Initialize JSON with the payload JSON
    }
  
    // Update the Item in the database
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
      },
    );
  
    // Step 7: Retrieve the fully updated Item
    const updatedItem = await this.itemRepository.findOne({
      where: { Item: itemId },
      // Uncomment if you need to include related entities
       relations: ['DataType', 'Unit', 'StdUnit'],
    });
  
    if (!updatedItem) {
      throw new Error('Updated Item not found');
    }
  
    // Step 8: Clear cache for the page using PageId from payload
    if (pageId) {
      const clean = await this.pageService.clearPageCache(pageId.toString());
      console.log(`Cache cleared for page ${pageId}`);
    } else {
      console.warn('PageId not found in the payload. Skipping cache clear.');
    }
  
    // Step 9: Return the updated Item and the Cell
    return {
      updatedItem,
      cell,
    };
  }
}
