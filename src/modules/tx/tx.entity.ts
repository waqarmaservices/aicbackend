import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('t-Tx')
export class Tx {
    @PrimaryGeneratedColumn()
    Tx: bigint;

    @Column({ name: 'Tx-Type', type: 'bigint' })
    TxType: bigint;

    @Column({ name: 'Tx-AuditTrail', type: 'jsonb' })
    TxAuditTrail: any;

    @Column({ name: 'Tx-User', type: 'bigint' })
    TxUser: User;

    @Column({ name: 'Tx-DateTime', type: 'timestamp' })
    TxDateTime: Date;

    @Column({ name: 'Tx-XID', type: 'bigint' })
    TxXID: bigint;
}
