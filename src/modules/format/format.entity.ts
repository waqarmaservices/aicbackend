import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Row } from '../row/row.entity';
import { Col } from '../col/col.entity';
import { Page } from '../page/page.entity';
import { Cell } from '../cell/cell.entity';

/**
 * Represents a format entity in the system.
 *
 * This entity corresponds to the 'tFormat' table in the database.
 */
@Entity('tFormat')
export class Format {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  Format: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'User' })
  User: User;

  @ManyToOne(() => Row, { nullable: false })
  @JoinColumn({ name: 'ObjectType' })
  ObjectType: Row;

  @Column({ type: 'bigint' })
  Object: number;

  @Column({ type: 'bigint', nullable: true })
  Container: number;

  @ManyToOne(() => Col, { nullable: true })
  @JoinColumn({ name: 'PgNestedCol' })
  PgNestedCol: Col;

  @Column({ type: 'smallint' })
  PgFreezeCol: number;

  @Column({ type: 'smallint' })
  PgExpand: number;

  @ManyToOne(() => Page, { nullable: true })
  @JoinColumn({ name: 'PgLevelSet' })
  PgLevelSet: Page;

  @ManyToOne(() => Page, { nullable: true })
  @JoinColumn({ name: 'PgSearchSet' })
  PgSearchSet: Page;

  @Column({ type: 'jsonb', nullable: true })
  PgSort: object;

  @Column({ type: 'jsonb', nullable: true })
  PgFilter: object;

  @ManyToOne(() => Row, { nullable: true })
  @JoinColumn({ name: 'RowSetTick' })
  RowSetTick: Row;

  @Column({ type: 'smallint', nullable: true })
  ColOrder: number;

  @Column({ type: 'smallint', nullable: true })
  ColMinWidth: number;

  @Column({ type: 'smallint', nullable: true })
  ItemOrder: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'Owner' })
  Owner: User;

  @ManyToOne(() => Cell, { nullable: true })
  @JoinColumn({ name: 'Default' })
  Default: Cell;

  @Column({ type: 'bigint', array: true, nullable: true })
  Status: number[];

  @ManyToOne(() => Row, { nullable: true })
  @JoinColumn({ name: 'Unit' })
  Unit: Row;

  @Column({ type: 'jsonb', nullable: true })
  FontStyle: object;

  @Column({ type: 'jsonb', nullable: true })
  Formula: object;

  @Column({ type: 'jsonb', nullable: true })
  Comment: object;

  @Column({ array: true, type: 'bigint' })
  TxList: number[];

  @ManyToOne(() => Row, { nullable: true })
  @JoinColumn({ name: 'Deleted' })
  Deleted: Row;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'DeletedBy' })
  DeletedBy: User;

  @Column({ type: 'timestamp', nullable: true })
  DeletedAt: Date;
}
