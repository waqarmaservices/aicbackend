import { Controller, Get, Post, Put, Delete, Param, Body, HttpStatus } from '@nestjs/common';
import { ColService } from './col.service';
import { ApiResponse } from '../../common/dtos/api-response.dto';
import { Col } from './col.entity';

@Controller('col')
export class ColController {
    constructor(private readonly colService: ColService) { }

    @Post()
    async createCol(@Body() payload: any): Promise<ApiResponse<any>> {
        try {
            const col = await this.colService.createCol(payload);
            return new ApiResponse(
                true,
                col,
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
            const cols = await this.colService.findAll();
            return new ApiResponse(
                true,
                cols,
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
    async findOne(@Param('id') id: number): Promise<ApiResponse<Col>> {
        try {
            const col = await this.colService.findOne(id);
            if (!col) {
                return new ApiResponse(
                    false,
                    null,
                    'Col not found',
                    HttpStatus.NOT_FOUND,
                );
            }
            return new ApiResponse(
                true,
                col,
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
    async updateCol(@Param('id') id: number, @Body() updateData: Partial<Col>): Promise<ApiResponse<Col>> {
        try {
            const updatedCol = await this.colService.updateCol(id, updateData);
            return new ApiResponse(
                true,
                updatedCol,
                undefined,
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
    async deleteCol(@Param('id') id: number): Promise<ApiResponse<void>> {
        try {
            await this.colService.deleteCol(id);
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
