import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('user')
    @UseInterceptors(FileInterceptor('file'))
    async importUser(@UploadedFile() file: Express.Multer.File) {
      const filePath = file.path;
      await this.userService.importData(filePath);
      return { message: 'User data imported successfully' };
    }
}
