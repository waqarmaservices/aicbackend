import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Row } from '../row/row.entity';
import { Col } from '../col/col.entity';
import { Page } from '../page/page.entity';
import { Cell } from '../cell/cell.entity';

@Entity('t-Format')
export class Format {
    @PrimaryGeneratedColumn()
    Format: number;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'User' })
    User: User;

    @ManyToOne(() => Row, { nullable: false })
    @JoinColumn({ name: 'Object-Type' })
    ObjectType: Row;

    @Column({ type: 'bigint' })
    Object: number;

    @Column({ type: 'bigint', nullable: true })
    Container: number;

    @ManyToOne(() => Col, { nullable: true })
    @JoinColumn({ name: 'PG-Nested-Col' })
    PGNestedCol: Col;

    @Column({ name: 'PG-Freeze-Col', type: 'smallint' })
    PGFreezeCol: number;

    @Column({ name: 'PG-Expand', type: 'smallint' })
    PGExpand: number;

    @ManyToOne(() => Page, { nullable: true })
    @JoinColumn({ name: 'PG-Level-Set' })
    PGLevelSet: Page;

    @ManyToOne(() => Page, { nullable: true })
    @JoinColumn({ name: 'PG-Search-Set' })
    PGSearchSet: Page;

    @Column({ name: 'PG-Sort', type: 'jsonb', nullable: true })
    PGSort: object;

    @Column({ name: 'PG-Filter', type: 'jsonb', nullable: true })
    PGFilter: object;

    @ManyToOne(() => Row, { nullable: true })
    @JoinColumn({ name: 'RowSet-Tick' })
    RowSetTick: Row;

    @Column({ name: 'Col-Order', type: 'smallint', nullable: true })
    ColOrder: number;

    @Column({ name: 'Col-Min-Width', type: 'smallint', nullable: true })
    ColMinWidth: number;

    @Column({ name: 'Item-Order', type: 'smallint', nullable: true })
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

    @Column({ name: 'Font-Style', type: 'jsonb', nullable: true })
    FontStyle: object;

    @Column({ type: 'jsonb', nullable: true })
    Formula: object;

    @Column({ type: 'jsonb', nullable: true })
    Comment: object;

    @Column({ type: 'bigint', array: true, nullable: true })
    TxList: number[];

    @ManyToOne(() => Row, { nullable: true })
    @JoinColumn({ name: 'Deleted' })
    Deleted: Row;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'Deleted-By' })
    DeletedBy: User;

    @Column({ name: 'Deleted-At', type: 'timestamp', nullable: true })
    DeletedAt: Date;
}
