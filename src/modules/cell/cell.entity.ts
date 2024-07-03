import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Col } from '../col/col.entity';
import { Row } from '../row/row.entity';
import { Item } from '../item/item.entity';

@Entity('t-Cell')
export class Cell {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    Cell: number;

    // @ManyToOne(() => Col, (col) => col.cells)
    // @JoinColumn({ name: 'Col' })
    // Col: Col;

    // @ManyToOne(() => Row, (row) => row.cells)
    // @JoinColumn({ name: 'Row' })
    // Row: Row;

    @ManyToOne(() => Col, { eager: true })
    @JoinColumn({ name: 'Col' })
    Col: Col;

    @ManyToOne(() => Row, { eager: true })
    @JoinColumn({ name: 'Row' })
    Row: Row;

    @ManyToOne(() => Row, { nullable: true, eager: true })
    @JoinColumn({ name: 'Data-Type' })
    DataType: Row;

    @Column({ name: 'DropDown-Source', type: 'jsonb' })
    DropDownSource: object;

    @Column('bigint', { array: true, nullable: true })
    Items: number[];
}
