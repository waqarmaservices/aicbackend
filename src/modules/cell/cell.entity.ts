import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Col } from 'modules/col/col.entity';
import { Row } from 'modules/row/row.entity';

/**
 * Represents a row entity in the system.
 *
 * This entity corresponds to the 'tCell' table in the database.
 */
@Entity('tCell')
export class Cell {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  Cell: number;

  @ManyToOne(() => Col, (cell) => cell.cells, { eager: true })
  @JoinColumn({ name: 'Col' })
  CellCol: Col;

  @Column({name: 'Col', type: 'bigint'})
  Col: number;

  @ManyToOne(() => Row, { eager: true })
  @JoinColumn({ name: 'Row' })
  CellRow: Row;

  @Column({name: 'Row', type: 'bigint'})
  Row: number;

  @ManyToOne(() => Row, { nullable: true, eager: true })
  @JoinColumn({ name: 'DataType' })
  DataType: Row;

  @Column({ type: 'jsonb' })
  DropDownSource: object;

  @Column({ array: true, type: 'bigint' })
  Items: number[];
}
