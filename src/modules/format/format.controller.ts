import { Controller, Get, Post, Put, Delete, Param, Body, HttpStatus } from '@nestjs/common';
import { FormatService } from './format.service';
import { ApiResponse } from '../../common/dtos/api-response.dto';
import { Format } from './format.entity';

@Controller('formats')
export class FormatController {
  constructor(private readonly formatService: FormatService) {}

  @Post()
  async createFormat(@Body() payload: any): Promise<ApiResponse<Format>> {
    try {
      const format = await this.formatService.createFormat(payload);
      return new ApiResponse(true, format, '', HttpStatus.CREATED);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll(): Promise<ApiResponse<Format[]>> {
    try {
      const formats = await this.formatService.findAll();
      return new ApiResponse(true, formats, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ApiResponse<Format>> {
    try {
      const format = await this.formatService.findOne(id);
      if (!format) {
        return new ApiResponse(false, null, 'Format not found', HttpStatus.NOT_FOUND);
      }
      return new ApiResponse(true, format, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async updateFormat(@Param('id') id: number, @Body() updateData: Partial<Format>): Promise<ApiResponse<Format>> {
    try {
      const updatedFormat = await this.formatService.updateFormat(id, updateData);
      return new ApiResponse(true, updatedFormat, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deleteFormat(@Param('id') id: number): Promise<ApiResponse<void>> {
    try {
      await this.formatService.deleteFormat(id);
      return new ApiResponse(true, null, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Put('delete-row/:rowId')
  async deleteRowAndUpdateFormat(
      @Param('rowId') rowId: number,
      @Body('userId') userId: number
  ): Promise<ApiResponse<any>> { // Use `any` for the response type to match your custom structure
      try {
          const updatedFormat = await this.formatService.updateFormatOnRowDelete(rowId, userId);
  
          // Build the response data with only available attributes
          const responseData: any = {
              Delete_Row : {
                  Format: updatedFormat.Format?.toString(),
                  Object: updatedFormat.Object?.toString(),
                  Deleted: updatedFormat.Deleted?.toString(),
                  DeletedBy: updatedFormat.DeletedBy?.toString(),
                  DeletedAt: updatedFormat.DeletedAt?.toISOString(),
              }
          };


          return new ApiResponse(true, responseData, '', HttpStatus.OK);
      } catch (error) {
          return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
      }
  }
  

}
