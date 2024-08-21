import { Controller, Get, Post, Put, Delete, Param, Body, HttpStatus } from '@nestjs/common';
import { CellService } from './cell.service';
import { ApiResponse } from '../../common/dtos/api-response.dto';
import { Cell } from './cell.entity';

@Controller('cell')
export class CellController {
    constructor(private readonly cellService: CellService) { }

    @Post()
    async createCell(@Body() payload: any): Promise<ApiResponse<any>> {
        try {
            const cell = await this.cellService.createCell(payload);

            if (!cell) {
                return new ApiResponse(false, null, 'Cell not created', HttpStatus.NOT_FOUND);
            }

            // Construct the response data with the desired nested structure
            const data = {
                Creted_Cell: {
                    Cell: cell.Cell,
                    Col: cell.CellCol?.Col,
                    Row: cell.CellRow?.Row,
                    DropDownSource: cell.DropDownSource,
                    Items: cell.Items,
                    DataType: cell.DataType?.Row,
                },
            };

            return new ApiResponse(true, data, '', HttpStatus.CREATED);
        } catch (error) {
            return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @Get()
    async findAll(): Promise<ApiResponse<Cell[]>> {
        try {
            const cells = await this.cellService.findAll();
            return new ApiResponse(true, cells, '', HttpStatus.OK);
        } catch (error) {
            return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':id')
    async getOneCell(@Param('id') id: number): Promise<ApiResponse<any>> {
        try {
            const cell = await this.cellService.getOneCell(id);
            if (!cell) {
                return new ApiResponse(false, null, 'Cell not found', HttpStatus.NOT_FOUND);
            }
            // Construct the response data with the desired nested structure
            const data = {
                Cell_Data: {
                    Cell: cell.Cell,
                    Col: cell.CellCol?.Col,
                    Row: cell.CellRow?.Row,
                    DropDownSource: cell.DropDownSource,
                    Items: cell.Items,
                    DataType: cell.DataType?.Row,
                    CellCol: {
                        Col: cell.CellCol?.Col,
                    },
                    CellRow: {
                        Row: cell.CellRow?.Row,
                        Inherit: cell.CellRow?.Inherit,
                        RowLevel: cell.CellRow?.RowLevel,
                        Pg: {
                            Pg: cell.CellRow?.Pg?.Pg,
                        },
                    },
                },
            };
            return new ApiResponse(true, data, '', HttpStatus.OK);
        } catch (error) {
            return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put(':id')
    async updateCell(@Param('id') id: number, @Body() updateData: Partial<any>): Promise<ApiResponse<any>> {
        try {
            const updatedCell = await this.cellService.updateCell(id, updateData);
            if (!updatedCell) {
                return new ApiResponse(false, null, 'Cell not found', HttpStatus.NOT_FOUND);
            }
            // Construct the response data with the desired nested structure
            const data = {
                updated_Cell: {
                    Cell: updatedCell.Cell,
                    Col: updatedCell.CellCol?.Col,
                    Row: updatedCell.CellRow?.Row,
                    DropDownSource: updatedCell.DropDownSource,
                    Items: updatedCell.Items,
                    DataType: updatedCell.DataType?.Row,
                    CellCol: {
                        Col: updatedCell.CellCol?.Col,
                    },
                    CellRow: {
                        Row: updatedCell.CellRow?.Row,
                        Inherit: updatedCell.CellRow?.Inherit,
                        RowLevel: updatedCell.CellRow?.RowLevel,
                        Pg: {
                            Pg: updatedCell.CellRow?.Pg?.Pg,
                        },
                    },
                },
            };
            return new ApiResponse(true, data, '', HttpStatus.OK);
        } catch (error) {
            return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete(':id')
    async deleteCell(@Param('id') id: number): Promise<ApiResponse<any>> {
        try {
            const deletedCell = await this.cellService.deleteCell(id);

            if (!deletedCell) {
                return new ApiResponse(false, null, 'Cell not found', HttpStatus.NOT_FOUND);
            }

            // Construct the response data with the desired structure
            const data = {
                Deleted_Cell: {
                    Cell: deletedCell.Cell,
                    Col: deletedCell.CellCol?.Col,
                    Row: deletedCell.CellRow?.Row,
                    DropDownSource: deletedCell.DropDownSource,
                    Items: deletedCell.Items,
                    CellCol: {
                        Col: deletedCell.CellCol?.Col,
                    },
                    CellRow: {
                        Row: deletedCell.CellRow?.Row,
                        Inherit: deletedCell.CellRow?.Inherit,
                        RowLevel: deletedCell.CellRow?.RowLevel,
                        Pg: {
                            Pg: deletedCell.CellRow?.Pg?.Pg,
                        },
                    },
                    DataType: deletedCell.DataType?.Row,
                },
            };

            return new ApiResponse(true, data, '', HttpStatus.OK);
        } catch (error) {
            return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
