import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { TxService } from './tx.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('tx')
export class TxController {
    constructor(private readonly txService: TxService) {}


    @Post('tx')
    @UseInterceptors(FileInterceptor('file'))
    async importTx(@UploadedFile() file: Express.Multer.File) {
      const filePath = file.path;
      await this.txService.importData(filePath);
      return { message: 'Tx data imported successfully' };
    }
}
