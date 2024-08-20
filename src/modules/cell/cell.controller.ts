import { Controller, Get, Post, Put, Delete, Param, Body, HttpStatus } from '@nestjs/common';
import { CellService } from './cell.service';
import { ApiResponse } from '../../common/dtos/api-response.dto';
import { Cell } from './cell.entity';

@Controller('cell')
export class CellController {
  constructor(private readonly cellService: CellService) {}

  @Post()
  async createCell(@Body() payload: any): Promise<ApiResponse<Cell>> {
    try {
      const cell = await this.cellService.createCell(payload);
      return new ApiResponse(true, cell, '', HttpStatus.CREATED);
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
  async getOneCell(@Param('id') cellId: number): Promise<ApiResponse<Cell>> {
    try {
      const cell = await this.cellService.getOneCell(cellId);
      if (!cell) {
        return new ApiResponse(false, null, 'Cell not found', HttpStatus.NOT_FOUND);
      }
      return new ApiResponse(true, cell, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async updateCell(@Param('id') id: number, @Body() updateData: Partial<any>): Promise<ApiResponse<any>> {
    try {
      const updatedCell = await this.cellService.updateCell(id, updateData);
      return new ApiResponse(true, updatedCell, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deleteCell(@Param('id') id: number): Promise<ApiResponse<void>> {
    try {
      await this.cellService.deleteCell(id);
      return new ApiResponse(true, null, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
