import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cell } from './cell.entity';
import { FormatService } from 'modules/format/format.service';
import { ItemService } from 'modules/item/item.service';
import { SYSTEM_INITIAL } from '../../constants';

@Injectable()
export class CellService {
  constructor(
    @InjectRepository(Cell)
    private readonly cellRepository: Repository<Cell>,
    @Inject(forwardRef(() => ItemService))
    private readonly itemService: ItemService,
    @Inject(forwardRef(() => FormatService))
    private readonly formatService: FormatService,
  ) {}

  async createCell(payload: any): Promise<Cell | null> {
    const cellData = this.cellRepository.create(payload as Partial<Cell>);
    const savedCell = await this.cellRepository.save(cellData);

    // Fetch the newly created cell with all relations
    return this.cellRepository.findOne({
      where: { Cell: savedCell.Cell },
      relations: ['CellCol', 'CellRow', 'DataType'], // Include other relations as needed
    });
  }

  async findAll(): Promise<Cell[]> {
    return await this.cellRepository.find({ relations: ['CellCol', 'CellRow', 'DataType'] });
  }

  async findOne(id: number): Promise<Cell> {
    return this.cellRepository.findOne({ where: { Cell: id } });
  }

  async findOneByColumnName(columnName: string, value: number): Promise<Cell> {
    return await this.cellRepository.findOne({
      where: { [columnName]: [value] },
    });
  }

  async getOneCell(id: number): Promise<Cell> {
    const cell = await this.cellRepository.findOne({
      where: { Cell: id },
      relations: ['CellCol', 'CellRow', 'DataType'], // Include other relations as needed
    });
    if (!cell) {
      throw new Error('Cell not found');
    }
    return cell;
  }

  async updateCell(id: number, updateData: Partial<any>): Promise<any> {
    await this.cellRepository.update(id, updateData);
    return this.findOne(id);
  }

  async deleteCell(id: number): Promise<Cell | null> {
    // Find the cell by ID
    const cell = await this.cellRepository.findOne({
      where: { Cell: id },
      relations: ['CellCol', 'CellRow', 'DataType'], // Include necessary relations
    });

    // If the cell doesn't exist, return null
    if (!cell) {
      return null;
    }

    // Delete the cell
    await this.cellRepository.remove(cell);

    // Return the deleted cell details
    return cell;
  }

  async findAllByColumnName(columnName: string, value: number): Promise<Cell[]> {
    return await this.cellRepository.find({
      where: { [columnName]: [value] },
    });
  }

  /**
   * Updates the items order for a given cell.
   *
   * This method first retrieves the format record associated with the specified cell.
   * If the format record is found, it updates the `CellItems` property with the provided list of item IDs.
   *
   * @param {number} Cell - The ID of the cell for which the items order needs to be updated.
   * @param {number[]} CellItems - An array of item IDs representing the new order of items for the cell.
   *
   */
  async updateCellItemsOrder(Cell: number, CellItems: number[]) {
    const cell = await this.findOne(Cell);
    if (!cell) {
      throw new NotFoundException('Cell not found');
    }
    if (!Array.isArray(CellItems) || CellItems.length < 2 || !CellItems.every((col) => typeof col === 'number')) {
      throw new BadRequestException('Invalid input: Items must be an array of at least two numbers');
    }

    const items = await this.itemService.getItemsByIds(CellItems);
    if (!items || items.length === 0) {
      throw new NotFoundException('No items found for the provided CellItems');
    }
    const cellFormatRecord = await this.formatService.findOneByColumnName('Object', cell.Cell);
    if (!cellFormatRecord) {
      // Call the service to create the tFormat record
      await this.formatService.createFormat({
        ObjectType: SYSTEM_INITIAL.CELL,
        Object: cell.Cell,
        CellItems: CellItems,
      });
    } else {
      // Call the service to update the CellItems in tFormat
      await this.formatService.updateFormatByObject(cell.Cell, { CellItems });
    }
  }
    // Find Cell By Row and Coll ids
    async findCellByColAndRow(colId: number, rowId: number): Promise<Cell> {
        const cell = await this.cellRepository.findOne({
            where: { Col: colId, Row: rowId },
            relations: ['CellCol', 'CellRow', 'DataType'], // Include other relations as needed
        });
        if (!cell) {
            throw new Error('Cell not found');
        }
        return cell;
    }
    // Update item Cell
    async updateCellitem(id: number, updateData: Partial<any>): Promise<Cell> {
        // Step 1: Find the existing Cell
        const cell = await this.findOne(id);
        if (!cell) {
            throw new Error('Cell not found');
        }
        // Step 2: Merge existing Items with new Items if provided in updateData
        if (updateData.Items) {
            let existingItems: number[] = [];
            // Assert that cell.Items is of type string or number[]
            const items = cell.Items as string | number[];
            // Check the type of existing cell.Items and parse it to an array
            if (typeof items === 'string') {
                existingItems = items
                    .replace(/[{}]/g, '') // Remove curly braces
                    .split(',')
                    .filter(Boolean) // Remove empty strings
                    .map((item) => parseInt(item.trim(), 10)); // Convert to array of numbers
            } else if (Array.isArray(items)) {
                existingItems = items;
            }
            // Ensure the new Items from updateData is an array
            const newItems = Array.isArray(updateData.Items) ? updateData.Items : [updateData.Items];
            // Merge new items with existing items, ensuring no duplicates
            const mergedItems = [...new Set([...existingItems, ...newItems])];
            // Convert the merged array back to the format needed by your database
            updateData.Items = `{${mergedItems.join(',')}}`;
        }
        // Step 3: Update the cell with the merged Items
        await this.cellRepository.update(id, updateData);
        // Step 4: Return the updated Cell
        return this.findOne(id);
    }
}
