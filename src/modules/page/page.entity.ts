
import { Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';


@Entity('t-PG')
export class Page {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'PG' })
    PG: number;
}
