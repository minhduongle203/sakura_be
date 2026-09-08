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

  // Dùng nội bộ cho auth (so sánh password) — có select hashedPassword
  findByUsername(username: string) {
    return this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.hashedPassword')
      .where('user.username = :username', { username })
      .getOne();
  }

  // Dùng cho các route public/controller — KHÔNG bao giờ trả hashedPassword
  findByUsernamePublic(username: string) {
    return this.usersRepo.findOneBy({ username });
  }

  findById(id: string) {
    return this.usersRepo.findOneBy({ id });
  }

  findByEmail(email: string) {
    return this.usersRepo.findOneBy({ email });
  }

  updateLastLogin(id: string) {
    return this.usersRepo.update(id, { lastLoginAt: new Date() });
  }

  create(data: Partial<User>) {
    const user = this.usersRepo.create(data);
    return this.usersRepo.save(user);
  }
}
