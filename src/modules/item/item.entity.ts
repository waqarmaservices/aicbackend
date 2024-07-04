import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Row } from '../row/row.entity';

@Entity('t-Item')
export class Item {
  @PrimaryGeneratedColumn({ name: 'Item' })
  Item: number;

  @Column({ type: 'bigint', array: true, nullable: true })
  Inherit: number[];

  @ManyToOne(() => Row, (row) => row.items)
  @JoinColumn({ name: 'Data-Type' })
  DataType: Row;

  @Column({ name: 'Object', type: 'bigint', nullable: true })
  Object: number;

  @Column({ name: 'SmallInt', type: 'smallint', nullable: true })
  SmallInt: number;

  @Column({ name: 'BigInt', type: 'bigint', nullable: true })
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

  @Column({ name: 'Unit', type: 'bigint', nullable: true })
  Unit: number;

  @Column({ name: 'Std-Qty', type: 'numeric', nullable: true })
  StdQty: number;

  @Column({ name: 'Std-Unit', type: 'bigint', nullable: true })
  StdUnit: number;

  @Column({ name: 'Foreign', type: 'jsonb', nullable: true })
  Foreign: any;
}
