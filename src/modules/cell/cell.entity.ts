import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Col } from 'modules/col/col.entity';
import { Row } from 'modules/row/row.entity';

@Entity('t-Cell')
export class Cell {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  Cell: number;

  // @ManyToOne(() => Col, (col) => col.cells)
  // @JoinColumn({ name: 'Col' })
  // Col: Col;

  // @ManyToOne(() => Row, (row) => row.cells)
  // @JoinColumn({ name: 'Row' })
  // Row: Row;

  @ManyToOne(() => Col, { eager: true })
  @JoinColumn({ name: 'Col' })
  Col: Col;

  @ManyToOne(() => Row, { eager: true })
  @JoinColumn({ name: 'Row' })
  Row: Row;

  @ManyToOne(() => Row, { nullable: true, eager: true })
  @JoinColumn({ name: 'Data-Type' })
  DataType: Row;

  @Column({ name: 'DropDown-Source', type: 'jsonb' })
  DropDownSource: object;

  @Column('bigint', { array: true })
  Items: number[];
}
