import { Controller } from '@nestjs/common';
import { CellService } from './cell.service';

@Controller('cell')
export class CellController {
    constructor(private readonly cellService: CellService) {}
}
