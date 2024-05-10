import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('t-PG')
export class Page {
    @PrimaryGeneratedColumn()
    PG: number;
}
