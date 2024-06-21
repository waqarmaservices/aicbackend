import { Entity, PrimaryColumn, OneToMany } from 'typeorm';
import { Cell } from '../cell/cell.entity';

@Entity('t-Col')
export class Col {
    [x: string]: any;
    @PrimaryColumn({ type: 'bigint',  name: 'Col' })
    Col: number;

    @OneToMany(() => Cell, (Cell) => Cell.Col)
    cells: Cell;
}

