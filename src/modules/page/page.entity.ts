import { Row } from 'modules/row/row.entity';
import { Format } from 'modules/format/format.entity';
import { Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

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
  PageName: string;

  @OneToMany(() => Format, (format) => format.formatObject)
  formats: Format[];
}
