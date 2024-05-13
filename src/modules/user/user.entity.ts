import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('t-User')
export class User {
    @PrimaryGeneratedColumn()
    User: bigint;

    @Column({ name: 'User-Type', type: 'bigint' })
    UserType: bigint;
}
