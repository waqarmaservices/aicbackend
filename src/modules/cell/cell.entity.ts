import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Col } from 'modules/col/col.entity';
import { Row } from 'modules/row/row.entity';
import { Item } from 'modules/item/item.entity';

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

    @Column('bigint', { array: true })
    Items: number[];

}
