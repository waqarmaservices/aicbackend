import { Entity, OneToMany, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';
import { Cell } from '../cell/cell.entity';

/**
 * Represents a col entity in the system.
 *
 * This entity corresponds to the 'tCol' table in the database.
 */
@Entity('tCol')
export class Col {
  @PrimaryColumn({ type: 'bigint' })
  Col: number;

  @OneToMany(() => Cell, (cell) => cell.Col)
  cells: Cell[];
}
