import {
    Entity,
    PrimaryColumn,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Cell } from '../cell/cell.entity';

@Entity('t-Col')
export class Col {
    @PrimaryColumn({ type: 'bigint', name: 'Col' })
    Col: number;

    @OneToMany(() => Cell, (cell) => cell.Col)
    cells: Cell[];
}
