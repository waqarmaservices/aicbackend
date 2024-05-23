import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ItemService } from './item.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('item')
export class ItemController {
    constructor(private readonly itemService: ItemService) {}

    @Post('item')
    @UseInterceptors(FileInterceptor('file'))
    async importItem(@UploadedFile() file: Express.Multer.File) {
      const filePath = file.path;
      await this.itemService.importData(filePath);
      return { message: 'Item data imported successfully' };
    }
}
