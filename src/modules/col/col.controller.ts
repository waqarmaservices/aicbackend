import { Controller } from '@nestjs/common';
import { ColService } from './col.service';

@Controller('col')
export class ColController {
    constructor(private readonly colService: ColService) {}
}
