import { Module } from '@nestjs/common';
import { RowService } from './row.service';
import { RowController } from './row.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Row } from './row.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Row])],
    controllers: [RowController],
    providers: [RowService],
})
export class RowModule {}
