import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ColService } from './col.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('col')
export class ColController {
    constructor(private readonly colService: ColService) {}

    
    @Post('col')
    @UseInterceptors(FileInterceptor('file'))
    async importCol(@UploadedFile() file: Express.Multer.File) {
      const filePath = file.path;
      await this.colService.importData(filePath);
      return { message: 'Col data imported successfully' };
    }
  
}
