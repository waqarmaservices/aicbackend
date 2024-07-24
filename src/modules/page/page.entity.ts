import { Row } from 'modules/row/row.entity';
import { Entity, OneToMany, PrimaryColumn } from 'typeorm';

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
  @PrimaryColumn({ type: 'bigint' })
  Pg: number;

  @OneToMany(() => Row, (row) => row.Pg)
  rows: Row[];
  PageName: string;
}
