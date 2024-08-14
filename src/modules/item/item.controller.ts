import { Controller, Get, Post, Put, Delete, Param, Body, HttpStatus } from '@nestjs/common';
import { ItemService } from './item.service';
import { ApiResponse } from '../../common/dtos/api-response.dto';
import { Item } from './item.entity';

@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  async createItem(@Body() payload: any): Promise<ApiResponse<any>> {
    try {
      const item = await this.itemService.createItem(payload);
      return new ApiResponse(true, item, '', HttpStatus.CREATED);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll(): Promise<ApiResponse<Item[]>> {
    try {
      const items = await this.itemService.findAll();
      return new ApiResponse(true, items, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ApiResponse<Item>> {
    try {
      const item = await this.itemService.findOne(id);
      if (!item) {
        return new ApiResponse(false, null, 'Item not found', HttpStatus.NOT_FOUND);
      }
      return new ApiResponse(true, item, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Put(':id')
  async updateItem(@Param('id') id: number, @Body() updateData: Partial<Item>): Promise<ApiResponse<Item>> {
    try {
      const updatedItem = await this.itemService.updateItem(id, updateData);
      return new ApiResponse(true, updatedItem, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deleteItem(@Param('id') id: number): Promise<ApiResponse<void>> {
    try {
      await this.itemService.deleteItem(id);
      return new ApiResponse(true, null, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('createitemupdatecell')
  async createItemAndUpdateCell(@Body() payload: any): Promise<ApiResponse<any>> {
    try {
      const { createdItem, updatedCell } = await this.itemService.createItemAndUpdateCell(payload);

      // Construct the response structure
      const responseData = {
        'Item-Creation': {
          createdItem: {
            Item: createdItem.Item.toString(),
            DataType: createdItem.DataType,
            Object: createdItem.Object,
            SmallInt: createdItem.SmallInt,
            BigInt: createdItem.BigInt,
            Num: createdItem.Num,
            Color: createdItem.Color,
            DateTime: createdItem.DateTime,
            JSON: createdItem.JSON,
            Qty: createdItem.Qty,
            Unit: createdItem.Unit,
            StdQty: createdItem.StdQty,
            StdUnit: createdItem.StdUnit,
            Foreign: createdItem.Foreign,
          },
          updatedCell: {
            Cell: updatedCell.Cell.toString(),
            Col: updatedCell.Col.toString(),
            Row: updatedCell.Row.toString(),
            Items: updatedCell.Items, // Convert item IDs to string
          },
        },
      };

      return new ApiResponse(true, responseData, '', HttpStatus.CREATED);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
