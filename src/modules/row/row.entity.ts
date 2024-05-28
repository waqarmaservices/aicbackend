import {
    Entity,
    PrimaryColumn,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { Page } from '../page/page.entity';
import { Cell } from '../cell/cell.entity';
import { Item } from '../item/item.entity';
import { Format } from '../format/format.entity';

@Entity('t-Row')
export class Row {
    @PrimaryColumn({ type: 'bigint' })
    Row: number;

    @ManyToOne(() => Page, { nullable: true })
    @JoinColumn({ name: 'PG' })
    PG: Page;

    @ManyToOne(() => Row, { nullable: true })
    @JoinColumn({ name: 'Share' })
    Share: Row;

    @Column({ type: 'bigint', array: true, nullable: true })
    Inherit: number[];

    @ManyToOne(() => Row, { nullable: true })
    @JoinColumn({ name: 'Row-Type' })
    RowType: Row;

    @Column({ name: 'Row-Level', type: 'smallint' })
    RowLevel: number;

    @ManyToOne(() => Row, { nullable: true })
    @JoinColumn({ name: 'Parent-Row' })
    ParentRow: Row;

    @ManyToOne(() => Row, { nullable: true })
    @JoinColumn({ name: 'Sibling-Row' })
    SiblingRow: Row;

    @OneToMany(() => Cell, (cell) => cell.Row)
    cells: Cell[];

    @OneToMany(() => Item, (item) => item.DataType)
    items: Item[];

    @OneToMany(() => Row, (row) => row.Share)
    shareRows: Row[];

    @OneToMany(() => Row, (row) => row.ParentRow)
    inheritRows: Row[];

    @OneToMany(() => Row, (row) => row.SiblingRow)
    siblingRows: Row[];

    @OneToMany(() => Row, (row) => row.RowType)
    rowTypes: Row[];

    @OneToMany(() => Format, (format) => format.RowSetTick)
    RowSetTickFormats: Format[];

    @OneToMany(() => Format, (format) => format.Unit)
    UnitFormats: Format[];

    @OneToMany(() => Format, (format) => format.Deleted)
    DeletedFormats: Format[];

    @OneToMany(() => Format, (format) => format.ObjectType)
    ObjectTypeFormats: Format[];

    @OneToMany(() => Item, (item) => item.StdUnit)
    StdUnitItems: Item[];
}
