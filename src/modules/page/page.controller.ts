import { Controller, Get, Post, Put, Delete, Param, Body, HttpStatus } from '@nestjs/common';
import { PageService } from './page.service';
import { ApiResponse } from '../../common/dtos/api-response.dto';
import { Page } from './page.entity';

@Controller('page')
export class PageController {
    constructor(private readonly pageService: PageService) { }

    @Post()
    async createPage(): Promise<ApiResponse<Page>> {
        try {
            const page = await this.pageService.createPage();
            return new ApiResponse(
                true,
                page,
                '',
                HttpStatus.CREATED,
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

    @Get()
    async findAll(): Promise<ApiResponse<Page[]>> {
        try {
            const pages = await this.pageService.findAll();
            return new ApiResponse(
                true,
                pages,
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
    async findOne(@Param('id') id: number): Promise<ApiResponse<Page>> {
        try {
            const page = await this.pageService.findOne(id);
            if (!page) {
                return new ApiResponse(
                    false,
                    null,
                    'Page not found',
                    HttpStatus.NOT_FOUND,
                );
            }
            return new ApiResponse(
                true,
                page,
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
    async updatePage(@Param('id') id: number, @Body() updateData: Partial<Page>): Promise<ApiResponse<Page>> {
        try {
            const updatedPage = await this.pageService.updatePage(id, updateData);
            return new ApiResponse(
                true,
                updatedPage,
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
    async deletePage(@Param('id') id: number): Promise<ApiResponse<void>> {
        try {
            await this.pageService.deletePage(id);
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


