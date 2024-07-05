import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Row } from '../row/row.entity';

@Entity('t-Tx')
export class Tx {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  Tx: number;

  @ManyToOne(() => Row, { nullable: false })
  @JoinColumn({ name: 'Tx-Type' })
  TxType: Row;

  @Column({ name: 'Tx-AuditTrail', type: 'jsonb' })
  TxAuditTrail: object;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'Tx-User' })
  TxUser: User;

  @Column({ name: 'Tx-DateTime', type: 'timestamp' })
  TxDateTime: Date;

  @Column({ name: 'Tx-XID', type: 'bigint' })
  TxXID: number;
}
