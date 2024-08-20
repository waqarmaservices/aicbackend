import { Controller, Get, Post, Put, Delete, Param, Body, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiResponse } from '../../common/dtos/api-response.dto';
import { User } from './user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() payload: any): Promise<ApiResponse<any>> {
    try {
      const user = await this.userService.createUser(payload);
      if (!user) {
        return new ApiResponse(false, null, 'User not found', HttpStatus.NOT_FOUND);
      }
      // Wrap the attribute inside the  object
      const data = {
        User_Created: {
          User: user.User,
          UserType: user.UserType,
        },
      };
      return new ApiResponse(true, data, '', HttpStatus.CREATED);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll(): Promise<ApiResponse<User[]>> {
    try {
      const users = await this.userService.findAll();
      return new ApiResponse(true, users, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ApiResponse<any>> {
    try {
      const user = await this.userService.findOne(id);
      if (!user) {
        return new ApiResponse(false, null, 'User not found', HttpStatus.NOT_FOUND);
      }
      // Wrap the attribute inside the object
      const data = {
        User_Data: {
          User: user.User,
          UserType: user.UserType,
        },
      };
      return new ApiResponse(true, data, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async updateUser(@Param('id') id: number, @Body() updateData: Partial<User>): Promise<ApiResponse<any>> {
    try {
      const updatedUser = await this.userService.updateUser(id, updateData);
      if (!updatedUser) {
        return new ApiResponse(false, null, 'User not found', HttpStatus.NOT_FOUND);
      }
      // Wrap the attribute inside the object
      const data = {
        Updated_User: {
          User: updateData.User,
          UserType: updateData.UserType,
        },
      };
      return new ApiResponse(true, data, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: number): Promise<ApiResponse<any>> {
    try {
      const deletedUser = await this.userService.deleteUser(id);
      if (!deletedUser) {
        return new ApiResponse(false, null, 'User not found', HttpStatus.NOT_FOUND);
      }
      // Wrap the User attribute inside the User object
      const data = {
        Updated_User: {
          user: deletedUser,
        },
      };
      return new ApiResponse(true, data, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
