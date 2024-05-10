import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Tx {
    @PrimaryGeneratedColumn()
    id: number;
}
