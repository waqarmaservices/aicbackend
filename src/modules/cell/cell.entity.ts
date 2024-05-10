import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Cell {
    @PrimaryGeneratedColumn()
    id: number;
}
