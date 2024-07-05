import { Module } from '@nestjs/common';
import { ColService } from './col.service';
import { ColController } from './col.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Col } from './col.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Col])],
  controllers: [ColController],
  providers: [ColService],
  exports: [ColService],
})
export class ColModule {}
