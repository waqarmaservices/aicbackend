import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('t-User')
export class User {
    @PrimaryGeneratedColumn()
    id: number;
}
