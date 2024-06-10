
import { Row } from 'modules/row/row.entity';
import { Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';


@Entity('t-PG')
export class Page {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'PG' })
    PG: number;

    @OneToMany(() => Row, row => row.PG)
    rows: Row[];
}
