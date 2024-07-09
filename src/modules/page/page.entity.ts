import { Row } from 'modules/row/row.entity';
import { Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

/**
 * Represents a page entity in the system.
 *
 * This entity corresponds to the 'tPg' table in the database.
 */
@Entity('tPg')
export class Page {
  /**
   * The primary key for the Page entity.
   *
   * This is an auto-incrementing bigint value.
   */
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  Pg: number;

  @OneToMany(() => Row, (row) => row.Pg)
  rows: Row[];
}
