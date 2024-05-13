import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Col } from '../col/col.entity';
import { Row } from '../row/row.entity';
import { Item } from '../item/item.entity';

@Entity('t-Cell')
export class Cell {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    Cell: bigint;

    @Column({ type: 'bigint' })
    Col: Col;

    @Column({ type: 'bigint' })
    Row: Row;

    @Column({ name: 'Data-Type', type: 'bigint' })
    DataType: bigint;

    @Column({ name: 'DropDown-Source', type: 'jsonb' })
    DropDownSource: any;

    @Column({ name: 'Items', type: 'bigint' })
    Items: Item[];
}
