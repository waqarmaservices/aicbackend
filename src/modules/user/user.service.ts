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

  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async findOneUser(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { User: id } });
  }
}
