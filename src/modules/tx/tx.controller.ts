import { Controller } from '@nestjs/common';
import { TxService } from './tx.service';

@Controller('tx')
export class TxController {
    constructor(private readonly txService: TxService) {}
}
