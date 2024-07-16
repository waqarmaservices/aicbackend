import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ImportService } from './import.service';

@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  /**
   * Handles file upload and imports sheet data.
   *
   * @param {Express.Multer.File} file - The uploaded file object.
   * @returns {Promise<any>} - A promise that resolves to the result of the import operation.
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        // Set the destination directory for uploaded files
        destination: './uploads',
        // Generate a unique filename for each uploaded file
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async importSheet(@UploadedFile() file: Express.Multer.File): Promise<any> {
    // Get the path of the uploaded file
    const filePath = file.path;
    // Call the import service to process the file and import the sheet data
    const data = await this.importService.importSheet(filePath);
    return data;
  }
}
