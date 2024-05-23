import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CellService } from './cell.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('cell')
export class CellController {
    constructor(private readonly cellService: CellService) {}

    @Post('cell')
    @UseInterceptors(FileInterceptor('file'))
    async importCell(@UploadedFile() file: Express.Multer.File) {
      const filePath = file.path;
      await this.cellService.importData(filePath);
      return { message: 'Cell data imported successfully' };
    }
}
