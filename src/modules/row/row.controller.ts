// import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
// import { RowService } from './row.service';
// import { ApiResponse } from '../../common/dtos/api-response.dto';
// import { HttpStatus } from '../../common/enum/http-status.enum';
// import { FileInterceptor } from '@nestjs/platform-express';

// @Controller('row')
// export class RowController {
//     constructor(private readonly rowService: RowService) { }

//     @Post()
//     async createRow(@Body() payload: any): Promise<ApiResponse<any>> {
//         console.log('payload', payload);
//         try {
//             await this.rowService.createRow(payload);
//             return new ApiResponse(
//                 true,
//                 'Row is created successfully.',
//                 undefined,
//                 HttpStatus.CREATED,
//             );
//         } catch (error) {
//             return new ApiResponse(
//                 false,
//                 undefined,
//                 'Something went wrong. Please try again',
//                 HttpStatus.INTERNAL_SERVER_ERROR,
//             );
//         }
//     }

    // @Get()
    // async findAll(): Promise<ApiResponse<any>> {
    //     try {
    //         const data = await this.rowService.findAll();
    //         return new ApiResponse(true, data, undefined, HttpStatus.OK);
    //     } catch (error) {
    //         return new ApiResponse(
    //             false,
    //             undefined,
    //             'Something went wrong. Please try again',
    //             HttpStatus.INTERNAL_SERVER_ERROR,
    //         );
    //     }
    



//     // @Post('row')
//     // @UseInterceptors(FileInterceptor('file'))
//     // async importRow(@UploadedFile() file: Express.Multer.File) {
//     //   const filePath = file.path;
//     //   await this.rowService.importData(filePath);
//     //   return { message: 'Row data imported successfully' };
//     // }
// }

import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    HttpStatus,
} from '@nestjs/common';
import { RowService } from './row.service';
import { ApiResponse } from '../../common/dtos/api-response.dto';
import { Row } from './row.entity';

@Controller('row')
export class RowController {
  constructor(private readonly rowService: RowService) {}

  @Post()
  async createRow(@Body() payload: any): Promise<ApiResponse<any>> {
    try {
      const row = await this.rowService.createRow(payload);
      return new ApiResponse(
        true,
        row,
        undefined,
        HttpStatus.CREATED,
      );
    } catch (error) {
      return new ApiResponse(
        false,
        undefined,
        'Something went wrong. Please try again',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll(): Promise<ApiResponse<any>> {
    try {
      const rows = await this.rowService.findAll();
      return new ApiResponse(
        true,
        rows,
        '',
        HttpStatus.OK,
      );
    } catch (error) {
      return new ApiResponse(
        false,
        null,
        'Something went wrong. Please try again',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ApiResponse<Row>> {
    try {
      const row = await this.rowService.findOne(id);
      if (!row) {
        return new ApiResponse(
          false,
          null,
          'Row not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return new ApiResponse(
        true,
        row,
        '',
        HttpStatus.OK,
      );
    } catch (error) {
      return new ApiResponse(
        false,
        null,
        'Something went wrong. Please try again',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async updateRow(@Param('id') id: number, @Body() updateData: Partial<Row>): Promise<ApiResponse<Row>> {
    try {
      const updatedRow = await this.rowService.updateRow(id, updateData);
      return new ApiResponse(
        true,
        updatedRow,
        '',
        HttpStatus.OK,
      );
    } catch (error) {
      return new ApiResponse(
        false,
        null,
        'Something went wrong. Please try again',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deleteRow(@Param('id') id: number): Promise<ApiResponse<void>> {
    try {
      await this.rowService.deleteRow(id);
      return new ApiResponse(
        true,
        null,
        '',
        HttpStatus.OK,
      );
    } catch (error) {
      return new ApiResponse(
        false,
        null,
        'Something went wrong. Please try again',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
