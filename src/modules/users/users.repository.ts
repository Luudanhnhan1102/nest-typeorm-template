import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersRepository extends Repository<UserEntity> {
  constructor(readonly dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }

  async verifyEmail(userId: number) {
    const user = await this.findOneByOrFail({ id: userId });
    user.isVerifiedMail = true;
    return this.save(user);
  }
}
