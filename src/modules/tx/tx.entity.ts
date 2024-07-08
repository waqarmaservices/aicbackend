import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Row } from '../row/row.entity';

/**
 * Represents a tx entity in the system.
 *
 * This entity corresponds to the 'tTx' table in the database.
 */
@Entity('tTx')
export class Tx {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  Tx: number;

  @ManyToOne(() => Row, { nullable: false })
  @JoinColumn({ name: 'TxType' })
  TxType: Row;

  @Column({ type: 'jsonb' })
  TxAuditTrail: object;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'TxUser' })
  TxUser: User;

  @Column({ type: 'timestamp' })
  TxDateTime: Date;

  @Column({ type: 'bigint' })
  TxXID: number;
}
