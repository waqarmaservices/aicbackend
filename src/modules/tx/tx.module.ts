import { Module } from '@nestjs/common';
import { TxService } from './tx.service';
import { TxController } from './tx.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tx } from './tx.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Tx])],
    controllers: [TxController],
    providers: [TxService],
})
export class TxModule {}
