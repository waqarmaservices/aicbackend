import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Row {
    @PrimaryGeneratedColumn()
    id: number;
}
