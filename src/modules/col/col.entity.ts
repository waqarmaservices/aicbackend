import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('t-Col')
export class Col {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    Col: number;
}
