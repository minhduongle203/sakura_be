import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  findByUsername(username: string) {
    return this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.hashedPassword')
      .where('user.username = :username', { username })
      .getOne();
  }

  findById(id: string) {
    return this.usersRepo.findOneBy({ id });
  }

  create(data: Partial<User>) {
    const user = this.usersRepo.create(data);
    return this.usersRepo.save(user);
  }
}
