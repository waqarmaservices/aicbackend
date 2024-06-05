import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tx } from './tx.entity';

@Injectable()
export class TxService {
  constructor(
    @InjectRepository(Tx)
    private readonly txRepository: Repository<Tx>,
  ) {}

  async createTx(payload: any): Promise<Tx[]> {
    const txData = this.txRepository.create(payload);
    return this.txRepository.save(txData);
  }

  async findAll(): Promise<Tx[]> {
    return this.txRepository.find();
  }

  async findOne(id: number): Promise<Tx> {
    return this.txRepository.findOne({ where: { Tx: id } });
  }

  async updateTx(id: number, updateData: Partial<Tx>): Promise<Tx> {
    await this.txRepository.update(id, updateData);
    return this.findOne(id);
  }

  async deleteTx(id: number): Promise<void> {
    await this.txRepository.delete(id);
  }
}
