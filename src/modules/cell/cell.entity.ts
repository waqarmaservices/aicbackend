import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Col } from '../col/col.entity';
import { Row } from '../row/row.entity';
import { Item } from '../item/item.entity';

@Entity('t-Cell')
export class Cell {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'Cell' })
    Cell: number;

    @ManyToOne(() => Col, col => col.cells)
    @JoinColumn({ name: 'Col' })
    Col: Col;

    @ManyToOne(() => Row, row => row.cells)
    @JoinColumn({ name: 'Row' })
    Row: Row;

    @Column({ type: 'bigint', name: 'Data-Type', nullable: true })
    DataType: number;

    @Column({ type: 'jsonb', name: 'DropDown-Source', nullable: true })
    DropDownSource: any;

    @Column({ type: 'bigint', array: true, name: 'Items', nullable: true })
    Items: number[];
}
