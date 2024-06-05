import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Col } from '../col/col.entity';
import { Row } from '../row/row.entity';

@Entity('t-Cell')
export class Cell {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    Cell: number;

    @ManyToOne(() => Col)
    @JoinColumn({ name: 'Col' })
    Col: Col;

    @ManyToOne(() => Row)
    @JoinColumn({ name: 'Row' })
    Row: Row;

    @ManyToOne(() => Row, { nullable: true })
    @JoinColumn({ name: 'Data-Type' })
    DataType: Row;

    @Column({ name: 'DropDown-Source', type: 'jsonb' })
    DropDownSource: object;

    @Column('bigint', { array: true, nullable: true })
    Items: number[];
}
