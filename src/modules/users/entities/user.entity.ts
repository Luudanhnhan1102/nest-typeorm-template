import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EGender, EUserStatus } from '../users.constants';
import { BaseEntity } from 'src/common/database/base-entity';
import { ERole } from '../users.constants';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({
    type: 'varchar',
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
  })
  password: string;

  @Column({ type: 'varchar', default: EUserStatus.active })
  status: EUserStatus;

  @Column({ type: 'varchar', nullable: true })
  avatar?: string;

  @Column({ type: 'boolean', default: false })
  isVerifiedMail?: boolean;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ type: 'varchar' })
  role: ERole;

  @Column({ type: 'varchar', nullable: true })
  gender?: EGender;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;
}
