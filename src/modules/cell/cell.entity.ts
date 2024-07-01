import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Col } from '../col/col.entity';
import { Row } from '../row/row.entity';
import { Item } from '../item/item.entity';

@Entity('t-Cell')
export class Cell {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    Cell: number;

    @ManyToOne(() => Col, col => col.cells)
    @JoinColumn({ name: 'Col' })
    Col: Col;

    @ManyToOne(() => Row, row => row.cells)
    @JoinColumn({ name: 'Row' })
    Row: Row;

    @Column({ type: 'bigint', nullable: true })
    'Data-Type': number;

    @Column({ type: 'jsonb', nullable: true })
    'DropDown-Source': any;

    @Column({ type: 'bigint', array: true, nullable: true })
    Items: number[];

    @OneToMany(() => Item, item => item.Cell)
    items: Item[];
}
