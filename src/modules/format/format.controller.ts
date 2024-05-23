import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FormatService } from './format.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('format')
export class FormatController {
    constructor(private readonly formatService: FormatService) {}
    
    @Post('format')
    @UseInterceptors(FileInterceptor('file'))
    async importFormat(@UploadedFile() file: Express.Multer.File) {
      const filePath = file.path;
      await this.formatService.importData(filePath);
      return { message: 'Format data imported successfully' };
    }
}
