import { Module } from '@nestjs/common';
import { FormatService } from './format.service';
import { FormatController } from './format.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Format } from './format.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Format])],
    controllers: [FormatController],
    providers: [FormatService],
})
export class FormatModule {}
