import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(payload: any): Promise<User> {
    const userData = this.userRepository.create(payload as Partial<User>);
    return this.userRepository.save(userData);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['UserType', 'Formats', 'OwnedFormats', 'DeletedFormats', 'Transactions'],
    });
  }

  async findOne(id: number): Promise<User> {
    return this.userRepository.findOne({
      where: { User: id },
      relations: ['UserType', 'Formats', 'OwnedFormats', 'DeletedFormats', 'Transactions'],
    });
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, updateData);
    return this.findOne(id);
  }
  async deleteUser(id: number): Promise<any | null> {
    // Fetch the user to get the user value before deletion
    const user = await this.userRepository.findOne({ where: { User: id } });

    if (!user) {
      return null; // Return null if the User does not exist
    }

    // Delete the user by its ID
    await this.userRepository.delete(id);
    // Return the user value of the deleted User
    return user.User;
  }

  async findOneUser(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { User: id } });
  }

  async getLastInsertedRecord(): Promise<User> {
    const users = await this.userRepository.find({
      order: {
        User: 'DESC',
      },
      take: 1,
    });
    return users[0];
  }
}
