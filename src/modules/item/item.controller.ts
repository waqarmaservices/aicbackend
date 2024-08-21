import { Controller, Get, Post, Put, Delete, Param, Body, HttpStatus } from '@nestjs/common';
import { ItemService } from './item.service';
import { ApiResponse } from '../../common/dtos/api-response.dto';
import { Item } from './item.entity';

@Controller('items')
export class ItemController {
    constructor(private readonly itemService: ItemService) { }

    @Post()
    async createItem(@Body() payload: any): Promise<ApiResponse<any>> {
        try {
            const item = await this.itemService.createItem(payload);
            if (!item) {
                return new ApiResponse(false, null, 'Cell not created', HttpStatus.NOT_FOUND);
            }

            // Construct the response data with the desired nested structure
            const data = {
                Creted_Item: {
                    Item: item.Item,
                    Inherit: item.Inherit,
                    Object: item.Object,
                    DataType: item.DataType,
                    SmallInt: item.SmallInt,
                    Num: item.Num,
                    BigInt: item.BigInt,
                    Color: item.Color,
                    DateTime: item.DateTime,
                    JSON: item.JSON,
                    Qty: item.Qty,
                    Unit: item.Unit,
                    StdUnit: item.StdUnit,
                    Foreign: item.Foreign
                },
            };
            return new ApiResponse(true, data, '', HttpStatus.CREATED);
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
    async findOne(@Param('id') id: number): Promise<ApiResponse<any>> {
        try {
            const item = await this.itemService.findOne(id);
            if (!item) {
                return new ApiResponse(false, null, 'Item not found', HttpStatus.NOT_FOUND);
            }

            // Construct the response data with the desired nested structure
            const data = {
                Item_Data: {
                    Item: item.Item,
                    Inherit: item.Inherit,
                    Object: item.Object,
                    DataType: item.DataType,
                    SmallInt: item.SmallInt,
                    Num: item.Num,
                    BigInt: item.BigInt,
                    Color: item.Color,
                    DateTime: item.DateTime,
                    JSON: item.JSON,
                    Qty: item.Qty,
                    Unit: item.Unit,
                    StdUnit: item.StdUnit,
                    Foreign: item.Foreign
                },
            };
            return new ApiResponse(true, data, '', HttpStatus.OK);
        } catch (error) {
            return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @Put(':id')
    async updateItem(@Param('id') id: number, @Body() updateData: Partial<any>): Promise<ApiResponse<any>> {
        try {
            const updatedItem = await this.itemService.updateItem(id, updateData);
            if (!updatedItem) {
                return new ApiResponse(false, null, 'Item not found', HttpStatus.NOT_FOUND);
            }

            // Construct the response data with the desired nested structure
            const data = {
                updated_Item: {
                    Item: updateData.Item,
                    Inherit: updateData.Inherit,
                    Object: updateData.Object,
                    DataType: updateData.DataType,
                    SmallInt: updateData.SmallInt,
                    Num: updateData.Num,
                    BigInt: updateData.BigInt,
                    Color: updateData.Color,
                    DateTime: updateData.DateTime,
                    JSON: updateData.JSON,
                    Qty: updateData.Qty,
                    Unit: updateData.Unit,
                    StdUnit: updateData.StdUnit,
                    Foreign: updateData.Foreign
                },
            };


            return new ApiResponse(true, data, '', HttpStatus.OK);
        } catch (error) {
            return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete(':id')
    async deleteItem(@Param('id') id: number): Promise<ApiResponse<any>> {
        try {
            const deletedItems = await this.itemService.deleteItem(id);
            if (!deletedItems) {
                return new ApiResponse(false, null, 'Item not found', HttpStatus.NOT_FOUND);
            }

            // Construct the response data with the desired nested structure
            const data = {
                Deleted_Item: {
                    Item: deletedItems,
                },
            };
            return new ApiResponse(true, data, '', HttpStatus.OK);
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
                "Item-Creation": {
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

    @Post('getcellandupdateitem')
    async getCellAndUpdateItem(@Body() payload: any): Promise<ApiResponse<any>> {
        try {
            const { updatedItem, cell } = await this.itemService.getCellAndUpdateItem(payload);

            // Construct the response structure
            const responseData = {
                "Cell-Data": {
                    cell: {
                        Cell: cell.Cell.toString(),
                        Col: cell.Col.toString(),
                        Row: cell.Row.toString(),
                        Items: cell.Items,
                    },
                    updatedItem: {
                        Item: updatedItem.Item.toString(),
                        DataType: updatedItem.DataType ? {
                            Row: updatedItem.DataType.Row.toString(),
                            RowLevel: updatedItem.DataType.RowLevel.toString(),
                        } : null,
                        Object: updatedItem.Object ? updatedItem.Object.toString() : null,
                        SmallInt: updatedItem.SmallInt,
                        BigInt: updatedItem.BigInt.toString(),
                        Num: updatedItem.Num.toString(),
                        Color: updatedItem.Color ? updatedItem.Color.toString() : null,
                        DateTime: updatedItem.DateTime.toISOString(),
                        JSON: updatedItem.JSON,
                        Qty: updatedItem.Qty.toString(),
                        Unit: updatedItem.Unit ? updatedItem.Unit.Row.toString() : null,
                        StdQty: updatedItem.StdQty.toString(),
                        StdUnit: updatedItem.StdUnit ? updatedItem.StdUnit.Row.toString() : null,
                        Foreign: updatedItem.Foreign
                    },
                },
            };

            return new ApiResponse(true, responseData, '', HttpStatus.OK);
        } catch (error) {
            return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
