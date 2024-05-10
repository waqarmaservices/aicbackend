import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Format {
    @PrimaryGeneratedColumn()
    id: number;
}
