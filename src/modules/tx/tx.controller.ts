import { Controller, Get, Post, Put, Delete, Param, Body, HttpStatus } from '@nestjs/common';
import { TxService } from './tx.service';
import { ApiResponse } from '../../common/dtos/api-response.dto';
import { Tx } from './tx.entity';

@Controller('txs')
export class TxController {
  constructor(private readonly txService: TxService) {}

  @Post()
  async createTx(@Body() payload: any): Promise<ApiResponse<Tx[]>> {
    try {
      const tx = await this.txService.createTx(payload);
      return new ApiResponse(true, tx, '', HttpStatus.CREATED);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll(): Promise<ApiResponse<Tx[]>> {
    try {
      const txs = await this.txService.findAll();
      return new ApiResponse(true, txs, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ApiResponse<Tx>> {
    try {
      const tx = await this.txService.findOne(id);
      if (!tx) {
        return new ApiResponse(false, null, 'Tx not found', HttpStatus.NOT_FOUND);
      }
      return new ApiResponse(true, tx, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async updateTx(@Param('id') id: number, @Body() updateData: Partial<Tx>): Promise<ApiResponse<Tx>> {
    try {
      const updatedTx = await this.txService.updateTx(id, updateData);
      return new ApiResponse(true, updatedTx, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deleteTx(@Param('id') id: number): Promise<ApiResponse<void>> {
    try {
      await this.txService.deleteTx(id);
      return new ApiResponse(true, null, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
