import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, PrimaryColumn } from 'typeorm';
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

  @OneToMany(() => Cell, (cell) => cell.Row)
  cells: Cell[];

  @OneToMany(() => Item, (item) => item['Data-Type'])
  items: Item[];

  // @OneToMany(() => Row, (row) => row.Share)
  // shareRows: Row[];

  // @OneToMany(() => Row, (row) => row.ParentRow)
  // inheritRows: Row[];

  // @OneToMany(() => Row, (row) => row.SiblingRow)
  // siblingRows: Row[];

  @OneToMany(() => Format, (format) => format.RowSetTick)
  RowSetTickFormats: Format[];

  // @OneToMany(() => Format, (format) => format.Unit)
  // UnitFormats: Format[];

  // @OneToMany(() => Format, (format) => format.Deleted)
  // DeletedFormats: Format[];

  // @OneToMany(() => Format, (format) => format.ObjectType)
  // ObjectTypeFormats: Format[];

  @OneToMany(() => Item, (item) => item['Std-Unit'])
  StdUnitItems: Item[];
}
