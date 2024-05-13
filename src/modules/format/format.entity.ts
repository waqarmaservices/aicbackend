import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { User } from '../user/user.entity';
import { Col } from '../col/col.entity';
import { Page } from '../page/page.entity';
import { Cell } from '../cell/cell.entity';
import { Tx } from '../tx/tx.entity';

@Entity('t-Format')
export class Format {
    @PrimaryGeneratedColumn()
    Format: bigint;

    @Column({ type: 'bigint' })
    User: User;

    @Column({ name: 'Object-Type', type: 'bigint' })
    ObjectType: bigint;

    @Column({ type: 'bigint' })
    Object: bigint;

    @Column({ type: 'bigint' })
    Container: bigint;

    @Column({ name: 'PG-Nested-Col', type: 'bigint' })
    PGNestedCol: Col;

    @Column({ name: 'PG-Freeze-Col', type: 'smallint' })
    PGFreezeCol: number;

    @Column({ name: 'PG-Expand', type: 'smallint' })
    PGExpand: number;

    @Column({ name: 'PG-Level-Set', type: 'bigint' })
    PGLevelSet: Page;

    @Column({ name: 'PG-Search-Set', type: 'bigint' })
    PGSearchSet: Page;

    @Column({ name: 'PG-Sort', type: 'jsonb' })
    PGSort: any;

    @Column({ name: 'PG-Filter', type: 'jsonb' })
    PGFilter: any;

    @Column({ name: 'RowSet-Tick', type: 'bigint' })
    RowSetTick: bigint;

    @Column({ name: 'Col-Order', type: 'smallint' })
    ColOrder: number;

    @Column({ name: 'Col-Min-Width', type: 'smallint' })
    ColMinWidth: number;

    @Column({ name: 'Item-Order', type: 'smallint' })
    ItemOrder: number;

    @Column({ name: 'Owner', type: 'bigint' })
    Owner: User;

    @Column({ type: 'bigint' })
    Default: Cell;

    @Column({ type: 'bigint' })
    Status: [];

    @Column({ type: 'bigint' })
    Unit: bigint;

    @Column({ name: 'Font-Style', type: 'jsonb' })
    FontStyle: any;

    @Column({ type: 'jsonb' })
    Formula: any;

    @Column({ type: 'jsonb' })
    Comment: any;

    @Column({ name: 'Tx-List', type: 'bigint' })
    TxList: Tx;

    @Column({ type: 'bigint' })
    Deleted: bigint;

    @Column({ name: 'Deleted-By', type: 'bigint' })
    DeletedBy: bigint;

    @Column({ name: 'Deleted-At', type: 'timestamp' })
    DeletedAt: Date;
}
