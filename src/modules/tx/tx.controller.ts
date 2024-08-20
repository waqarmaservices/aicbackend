import { Controller, Get, Post, Put, Delete, Param, Body, HttpStatus } from '@nestjs/common';
import { TxService } from './tx.service';
import { ApiResponse } from '../../common/dtos/api-response.dto';
import { Tx } from './tx.entity';

@Controller('txs')
export class TxController {
  constructor(private readonly txService: TxService) {}

  @Post()
  async createTx(@Body() payload: any): Promise<ApiResponse<any>> {
    try {
      const tx = await this.txService.createTx(payload);
      // Construct the response data if creation is successful
      const data = {
        Tx: tx.Tx,
        TxType: tx.TxType,
        TxAuditTrail: tx.TxAuditTrail,
        TxUser: tx.TxUser,
        TxDateTime: tx.TxDateTime,
        TxXID: tx.TxXID,
      };
      return new ApiResponse(true, { Transaction: data }, '', HttpStatus.CREATED);
    } catch (error) {
      console.error('Error in createTx:', error);
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
  async getOneTx(@Param('id') id: number): Promise<ApiResponse<any>> {
    try {
      const tx = await this.txService.getOneTx(id);
      if (!tx) {
        return new ApiResponse(false, null, 'Transaction not found', HttpStatus.NOT_FOUND);
      }

      // Construct response data
      const data = {
        Tx: tx.Tx,
        TxType: tx.TxType,
        TxAuditTrail: tx.TxAuditTrail,
        TxUser: tx.TxUser,
        TxDateTime: tx.TxDateTime,
        TxXID: tx.TxXID,
      };

      return new ApiResponse(true, { Transaction: data }, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async updateTx(@Param('id') id: number, @Body() updateData: Partial<Tx>): Promise<ApiResponse<any>> {
    try {
      const updatedTx = await this.txService.updateTx(id, updateData);
      if (!updatedTx) {
        return new ApiResponse(false, null, 'Transaction not found', HttpStatus.NOT_FOUND);
      }

      // Construct response data
      const data = {
        Tx: updatedTx.Tx,
        TxType: updatedTx.TxType,
        TxAuditTrail: updatedTx.TxAuditTrail,
        TxUser: updatedTx.TxUser,
        TxDateTime: updatedTx.TxDateTime,
        TxXID: updatedTx.TxXID,
      };

      return new ApiResponse(true, { Updated_Transaction: data }, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deleteTx(@Param('id') id: number): Promise<ApiResponse<any>> {
    try {
      const deletedTx = await this.txService.deleteTx(id);
      if (!deletedTx) {
        return new ApiResponse(false, null, 'Transaction not found', HttpStatus.NOT_FOUND);
      }

      // Construct response data
      const data = {
        Deleted_Transaction: {
          Tx: deletedTx.Tx,
          TxType: deletedTx.TxType,
          TxUser: deletedTx.TxUser,
          TxDateTime: deletedTx.TxDateTime,
          TxXID: deletedTx.TxXID,
        },
      };

      return new ApiResponse(true, data, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
