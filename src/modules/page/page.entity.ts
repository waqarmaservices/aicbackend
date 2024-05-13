import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('t-PG')
export class Page {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    PG: number;
}
