// page.entity.ts
import { Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Row } from '../row/row.entity';

@Entity('t-PG')
export class Page {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    PG: number;

    @OneToMany(() => Row, (row) => row.PG)
    rows: Row[];
}
