import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Row } from '../row/row.entity';

@Entity('t-Item')
export class Item {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    Item: number;

    @Column('bigint', { array: true, nullable: true })
    Inherit: number[];

    @ManyToOne(() => Row, (row) => row.items)
    @JoinColumn({ name: 'Data-Type' })
    DataType: Row;

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
    JSON: object;

    @Column({ type: 'numeric', nullable: true })
    Qty: number;

    @ManyToOne(() => Row, { nullable: true })
    @JoinColumn({ name: 'Unit' })
    Unit: Row;

    @Column({ name: 'Std-Qty', type: 'numeric', nullable: true })
    StdQty: number;

    @ManyToOne(() => Row, { nullable: true })
    @JoinColumn({ name: 'Std-Unit' })
    StdUnit: Row;

    @Column({ type: 'jsonb', nullable: true })
    Foreign: object;
}
