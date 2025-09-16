import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('user_detail')
export class UserDetail {
  @PrimaryColumn({ type: 'bigint', name: 'userId' })
  userId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sex: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  icon: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  grade: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  class: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  school: string;
}
