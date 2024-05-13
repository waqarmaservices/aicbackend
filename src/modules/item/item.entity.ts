import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Cell } from '../cell/cell.entity';

@Entity('t-Item')
export class Item {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    Item: bigint;

    @Column({ type: 'bigint' })
    Cell: Cell;

    @Column({ type: 'bigint' })
    Inherit: Item[];

    @Column({ name: 'Data-Type', type: 'bigint' })
    DataType: bigint;

    @Column({ type: 'bigint' })
    Object: bigint;

    @Column({ type: 'smallint' })
    SmallInt: number;

    @Column({ type: 'bigint' })
    BigInt: bigint;

    @Column({ type: 'numeric' })
    Num: number;

    @Column({ type: 'bytea' })
    Color: Buffer;

    @Column({ type: 'timestamp' })
    DateTime: Date;

    @Column({ type: 'jsonb' })
    JSON: any;

    @Column({ type: 'numeric' })
    Qty: number;

    @Column({ type: 'bigint' })
    Unit: bigint;

    @Column({ name: 'Std-Qty', type: 'numeric' })
    StdQty: number;

    @Column({ name: 'Std-Unit', type: 'bigint' })
    StdUnit: bigint;

    @Column({ type: 'jsonb' })
    Foreign: any;
}
