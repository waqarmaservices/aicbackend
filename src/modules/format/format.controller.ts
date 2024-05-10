import { Controller } from '@nestjs/common';
import { FormatService } from './format.service';

@Controller('format')
export class FormatController {
    constructor(private readonly formatService: FormatService) {}
}
