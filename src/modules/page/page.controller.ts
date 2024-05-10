import { Controller, Get, Post } from '@nestjs/common';
import { PageService } from './page.service';
import { ApiResponse } from '../../common/dtos/api-response.dto';
import { HttpStatus } from '../../common/enum/http-status.enum';

@Controller('page')
export class PageController {
    constructor(private readonly pageService: PageService) {}

    @Get()
    async findAll(): Promise<ApiResponse<any>> {
        try {
            const data = await this.pageService.findAll();
            return new ApiResponse(true, data, undefined, HttpStatus.OK);
        } catch (error) {
            return new ApiResponse(
                false,
                undefined,
                'Something went wrong. Please try again',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post()
    async createPage(): Promise<ApiResponse<any>> {
        try {
            await this.pageService.createPage();
            return new ApiResponse(
                true,
                'Page is created successfully.',
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
}
