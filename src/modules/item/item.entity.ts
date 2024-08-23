import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Row } from '../row/row.entity';
import { Page } from '../page/page.entity';
import { Col } from '../col/col.entity';

/**
 * Represents a item entity in the system.
 *
 * This entity corresponds to the 'tItem' table in the database.
 */
@Entity('tItem')
export class Item {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  Item: number;

  @Column({ type: 'bigint', array: true, nullable: true })
  Inherit: number[];

  @ManyToOne(() => Row, (row) => row.DataTypeItems)
  @JoinColumn({ name: 'DataType' })
  DataType: Row;

  @Column({ name: 'DataType', type: 'bigint', nullable: true })
  ItemDataType: number;

  @Column({ type: 'bigint', nullable: true })
  Object: number;

  @Column({ type: 'smallint', nullable: true })
  SmallInt: number;

  @Column({ type: 'bigint', nullable: true })
  BigInt: number;

  @Column({ name: 'Num', type: 'numeric', nullable: true })
  Num: number;

  @Column({ name: 'Color', type: 'bytea', nullable: true })
  Color: Buffer;

  @Column({ name: 'DateTime', type: 'timestamp', nullable: true })
  DateTime: Date;

  @Column({ name: 'JSON', type: 'jsonb', nullable: true })
  JSON: any;

  @Column({ name: 'Qty', type: 'numeric', nullable: true })
  Qty: number;

  @ManyToOne(() => Row)
  @JoinColumn({ name: 'Unit' })
  Unit: Row;

  @Column({ type: 'numeric', nullable: true })
  StdQty: number;

  @ManyToOne(() => Row)
  @JoinColumn({ name: 'StdUnit' })
  StdUnit: Row;

  @Column({ type: 'jsonb', nullable: true })
  Foreign: any;

  @ManyToOne(() => Row, (row) => row.Row)
  @JoinColumn({ name: 'Object' })
  ItemObject: Row;
}
