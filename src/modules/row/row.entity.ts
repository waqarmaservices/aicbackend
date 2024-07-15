import { Entity, Column, ManyToOne, JoinColumn, OneToMany, PrimaryColumn } from 'typeorm';
import { Page } from '../page/page.entity';
import { Cell } from '../cell/cell.entity';
import { Item } from '../item/item.entity';
import { Format } from '../format/format.entity';

/**
 * Represents a row entity in the system.
 *
 * This entity corresponds to the 'tRow' table in the database.
 */
@Entity('tRow')
export class Row {
  /**
   * The primary key for the Page entity.
   *
   * This is an auto-incrementing bigint value.
   */
  @PrimaryColumn({ type: 'bigint' })
  Row: number;

  @ManyToOne(() => Page, { eager: true })
  @JoinColumn({ name: 'Pg' })
  Pg: Page;

  @ManyToOne(() => Row, { nullable: true })
  @JoinColumn({ name: 'Share' })
  Share: Row;

  @Column({ type: 'bigint', array: true, nullable: true })
  Inherit: number[];

  @Column({ type: 'smallint' })
  RowLevel: number;

  @ManyToOne(() => Row, { nullable: true })
  @JoinColumn({ name: 'ParentRow' })
  ParentRow: Row;

  @ManyToOne(() => Row, { nullable: true })
  @JoinColumn({ name: 'SiblingRow' })
  SiblingRow: Row;

  @OneToMany(() => Cell, (cell) => cell.CellRow)
  cells: Cell[];

  @OneToMany(() => Item, (item) => item.DataType)
  DataTypeItems: Item[];

  @OneToMany(() => Format, (format) => format.RowSetTick)
  RowSetTickFormats: Format[];

  @OneToMany(() => Item, (item) => item.StdUnit)
  StdUnitItems: Item[];
}
