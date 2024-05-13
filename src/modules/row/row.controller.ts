import { Controller, Post, Body } from '@nestjs/common';
import { RowService } from './row.service';
import { ApiResponse } from '../../common/dtos/api-response.dto';
import { HttpStatus } from '../../common/enum/http-status.enum';

@Controller('row')
export class RowController {
    constructor(private readonly rowService: RowService) {}

    @Post()
    async createRow(@Body() payload: any): Promise<ApiResponse<any>> {
        console.log('payload', payload);
        try {
            await this.rowService.createRow(payload);
            return new ApiResponse(
                true,
                'Row is created successfully.',
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
