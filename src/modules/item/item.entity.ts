import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Cell } from '../cell/cell.entity';

@Entity('t-Item')
export class Item {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    Item: number;

    @ManyToOne(() => Cell, cell => cell.Items)
    @JoinColumn({ name: 'Cell' })
    Cell: Cell;

    @Column({ type: 'bigint', array: true, nullable: true })
    Inherit: number[];

    @Column({ type: 'bigint' })
    'Data-Type': number;

    @Column({ type: 'bigint', nullable: true })
    Object: number;

    @Column({ type: 'smallint', nullable: true })
    SmallInt: number;

    @Column({ type: 'bigint', nullable: true })
    BigInt: number;

    @Column({ type: 'numeric', nullable: true })
    Num: number;

    @Column({ type: 'bytea', nullable: true })
    Color: Buffer;

    @Column({ type: 'timestamp', nullable: true })
    DateTime: Date;

    @Column({ type: 'jsonb', nullable: true })
    JSON: any;

    @Column({ type: 'numeric', nullable: true })
    Qty: number;

    @Column({ type: 'bigint', nullable: true })
    Unit: number;

    @Column({ type: 'numeric', nullable: true })
    'Std-Qty': number;

    @Column({ type: 'bigint', nullable: true })
    'Std-Unit': number;

    @Column({ type: 'jsonb', nullable: true })
    Foreign: any;
}
