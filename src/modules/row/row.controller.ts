import { Controller } from '@nestjs/common';
import { RowService } from './row.service';

@Controller('row')
export class RowController {
    constructor(private readonly rowService: RowService) {}
}
