import { Entity, PrimaryColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Cell } from '../cell/cell.entity';

@Entity('t-Col')
export class Col {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    Col: number;

    @OneToMany(() => Cell, cell => cell.Col)
    cells: Cell[];
}

