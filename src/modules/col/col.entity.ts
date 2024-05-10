import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Col {
    @PrimaryGeneratedColumn()
    id: number;
}
