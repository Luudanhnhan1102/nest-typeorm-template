import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { ICreateUser } from './users.type';
import { JwtInternalService } from '../jwt/jwt.service';
import { Errors } from '../common/errors/errors';
import { ReadUserDto } from './dto/readUser.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UserEntity } from './entities/user.entity';
import { getPaginationHeaders } from 'src/shared/pagination-helper';
import { Pagination } from 'src/shared';

@Injectable()
export class UsersService {
  constructor(
    private usersRepo: UsersRepository,
    private jwtService: JwtInternalService,
  ) {}

  async registerUPUser(input: ICreateUser) {
    const user = await this.createNewUser({
      ...input,
      password: await this.jwtService.hash(input.password),
    });
    return user;
  }

  async createNewUser(
    input: Omit<ICreateUser, 'password'> & {
      password?: string;
    },
  ) {
    const doesExist = await this.usersRepo.existsBy({
      email: input.email,
    });
    if (doesExist) {
      throw new BadRequestException(Errors.USER_EXISTS);
    }
    const newUser = await this.usersRepo.save({
      ...input,
    });

    return this.returnUserData(newUser);
  }

  async updatePassword(userId: number, password: string) {
    const user = await this.usersRepo.findOneByOrFail({ id: userId });
    user.password = await this.jwtService.hash(password);
    await this.usersRepo.save(user);
    return this.returnUserData(user);
  }

  async readUser(userId: number) {
    const user = await this.usersRepo.findOneByOrFail({ id: userId });
    return this.returnUserData(user);
  }

  findByEmail(email: string) {
    return this.usersRepo.findOneBy({
      email,
    });
  }

  findByIdOrFail(userId: number) {
    return this.usersRepo.findOneByOrFail({ id: userId });
  }

  findByEmailOrFail(email: string) {
    return this.usersRepo.findOneByOrFail({
      email,
    });
  }

  async getUsers() {
    const users = await this.usersRepo.find();
    return plainToInstance(ReadUserDto, users);
  }

  async updateProfile(userId: number, body: UpdateUserDto) {
    const user = await this.usersRepo.findOneByOrFail({ id: userId });
    if (user.firstName === body.firstName && user.lastName === body.lastName) {
      return this.returnUserData(user);
    }

    user.firstName = body.firstName;
    user.lastName = body.lastName;

    return this.returnUserData(await this.usersRepo.save(user));
  }

  async verifyEmail(userId: number) {
    return this.returnUserData(await this.usersRepo.verifyEmail(userId));
  }

  async findAll({ perPage, page }: Pagination) {
    const res = await this.usersRepo.findAndCount();

    return {
      headers: getPaginationHeaders({ perPage, page }, res[1]),
      items: plainToInstance(ReadUserDto, res[0]),
    };
  }

  returnUserData(user: UserEntity) {
    return plainToInstance(ReadUserDto, user);
  }
}
