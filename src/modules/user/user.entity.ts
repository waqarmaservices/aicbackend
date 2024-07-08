import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, PrimaryColumn } from 'typeorm';
import { Row } from '../row/row.entity';
import { Format } from '../format/format.entity';
import { Tx } from '../tx/tx.entity';

/**
 * Represents a user entity in the system.
 *
 * This entity corresponds to the 'tUser' table in the database.
 */
@Entity('tUser')
export class User {
  @PrimaryColumn({ type: 'bigint' })
  User: number;

  @ManyToOne(() => Row, { nullable: false })
  @JoinColumn({ name: 'UserType' })
  UserType: Row;

  @OneToMany(() => Format, (format) => format.User)
  Formats: Format[];

  @OneToMany(() => Format, (format) => format.Owner)
  OwnedFormats: Format[];

  @OneToMany(() => Format, (format) => format.DeletedBy)
  DeletedFormats: Format[];

  @OneToMany(() => Tx, (tx) => tx.TxUser)
  Transactions: Tx[];
}
