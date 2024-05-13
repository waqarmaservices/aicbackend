import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Page } from '../page/page.entity';

@Entity('t-Row')
export class Row {
    @PrimaryGeneratedColumn()
    Row: bigint;

    @Column({ type: 'bigint' })
    PG: Page;

    @Column({ type: 'bigint' })
    Share: Row;

    @Column({ type: 'bigint' })
    Inherit: Row[];

    @Column({ name: 'Row-Type', type: 'bigint' })
    RowType: bigint;

    @Column({ name: 'Row-Level', type: 'smallint' })
    RowLevel: number;

    @Column({ name: 'Parent-Row', type: 'bigint' })
    ParentRow: Row;

    @Column({ name: 'Sibling-Row', type: 'bigint' })
    SiblingRow: Row;
}
