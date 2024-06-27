import { Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Cell } from '../cell/cell.entity';

@Entity('t-Col')
export class Col {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'Col' })
    Col: number;

    @OneToMany(() => Cell, (Cell) => Cell.Col)
    cells: Cell[];
}
