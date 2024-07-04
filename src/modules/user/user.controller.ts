import { Controller, Get, Post, Put, Delete, Param, Body, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiResponse } from '../../common/dtos/api-response.dto';

import { User } from './user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() payload: any): Promise<ApiResponse<User[]>> {
    try {
      const user = await this.userService.createUser(payload);
      return new ApiResponse(true, user, '', HttpStatus.CREATED);
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
  async findOne(@Param('id') id: number): Promise<ApiResponse<User>> {
    try {
      const user = await this.userService.findOne(id);
      if (!user) {
        return new ApiResponse(false, null, 'User not found', HttpStatus.NOT_FOUND);
      }
      return new ApiResponse(true, user, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async updateUser(@Param('id') id: number, @Body() updateData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const updatedUser = await this.userService.updateUser(id, updateData);
      return new ApiResponse(true, updatedUser, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: number): Promise<ApiResponse<void>> {
    try {
      await this.userService.deleteUser(id);
      return new ApiResponse(true, null, '', HttpStatus.OK);
    } catch (error) {
      return new ApiResponse(false, null, 'Something went wrong. Please try again', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
