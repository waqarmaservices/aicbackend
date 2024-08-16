import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tx } from './tx.entity';

@Injectable()
export class TxService {
    constructor(
        @InjectRepository(Tx)
        private readonly txRepository: Repository<Tx>,
    ) { }

    async createTx(payload: any): Promise<any> {
        const txData = this.txRepository.create(payload);
        return this.txRepository.save(txData);
    }

    async findAll(): Promise<Tx[]> {
        return this.txRepository.find();
    }

    async getOneTx(id: number): Promise<Tx | null> {
        return this.txRepository.findOne({
            where: { Tx: id },
            relations: ['TxType', 'TxUser'], // Add other relations if needed
        });
    }

    async updateTx(id: number, updateData: Partial<Tx>): Promise<Tx | null> {
        await this.txRepository.update(id, updateData);
        return this.getOneTx(id); // Fetch the updated Tx
    }

    async deleteTx(id: number): Promise<Tx | null> {
        const txToDelete = await this.getOneTx(id);
        if (txToDelete) {
            await this.txRepository.remove(txToDelete);
        }
        return txToDelete;
    }
}
