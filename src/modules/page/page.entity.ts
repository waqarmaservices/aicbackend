import { Row } from 'modules/row/row.entity';
import { Entity, PrimaryColumn, OneToMany } from 'typeorm';

@Entity('t-PG')
export class Page {
    @PrimaryColumn({ type: 'bigint', name: 'PG' })
    PG: number;

    @OneToMany(() => Row, (row) => row.PG)
    rows: Row[];
}
