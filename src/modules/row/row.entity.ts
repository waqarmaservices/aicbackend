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

    @ManyToOne(() => Page, { eager: true })
    @JoinColumn({ name: 'PG' })
    PG: Page;

    @Column({ type: 'bigint', name: 'Share', nullable: true })
    Share: Row;

    @Column({ type: 'bigint', array: true, nullable: true })
    Inherit: number[];

    @Column({ name: 'Row-Level', type: 'smallint' })
    RowLevel: number;

    @Column({ type: 'bigint', name: 'Parent-Row',  nullable: true })
    ParentRow: number;

    @Column({ type: 'bigint', name: 'Sibling-Row', nullable: true })
    SiblingRow: number;

    @OneToMany(() => Cell, cell => cell.Row)
    cells: Cell[];

    @OneToMany(() => Item, (item) => item["Data-Type"])
    items: Item[];

    // @OneToMany(() => Row, (row) => row.Share)
    // shareRows: Row[];

    // @OneToMany(() => Row, (row) => row.ParentRow)
    // inheritRows: Row[];

    // @OneToMany(() => Row, (row) => row.SiblingRow)
    // siblingRows: Row[];

    // @OneToMany(() => Row, (row) => row.RowType)
    // rowTypes: Row[];

    // @OneToMany(() => Format, (format) => format.RowSetTick)
    // RowSetTickFormats: Format[];

    // @OneToMany(() => Format, (format) => format.Unit)
    // UnitFormats: Format[];

    // @OneToMany(() => Format, (format) => format.Deleted)
    // DeletedFormats: Format[];

    // @OneToMany(() => Format, (format) => format.ObjectType)
    // ObjectTypeFormats: Format[];

    // @OneToMany(() => Item, (item) => item["Std-Unit"])
    // StdUnitItems: Item[];
     // @ManyToOne(() => Row, { nullable: true })
    // @JoinColumn({ name: 'Row-Type' })
    // RowType: Row;
}

