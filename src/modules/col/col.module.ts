import { Module } from '@nestjs/common';
import { ColService } from './col.service';
import { ColController } from './col.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Col } from './col.entity';
import { Format } from 'modules/format/format.entity';
import { FormatService } from 'modules/format/format.service';

@Module({
  imports: [TypeOrmModule.forFeature([Col, Format])],
  controllers: [ColController],
  providers: [ColService, FormatService],
  exports: [ColService],
})
export class ColModule {}
