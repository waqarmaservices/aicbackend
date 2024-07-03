import {
    Entity,
    PrimaryGeneratedColumn,
    PrimaryColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { Row } from '../row/row.entity';
import { Format } from '../format/format.entity';
import { Tx } from '../tx/tx.entity';

@Entity('t-User')
export class User {
    @PrimaryColumn()
    User: number;

    @ManyToOne(() => Row, { nullable: false })
    @JoinColumn({ name: 'User-Type' })
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
