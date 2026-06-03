import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Session } from '../../entities/sesson.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private sessionsRepo: Repository<Session>,
  ) {}

    // Hash token trước khi lưu vào cơ sở dữ liệu để tăng cường bảo mật
  hashToken(rawToken: string) {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  // Tạo một session mới với thông tin người dùng
  create(data: {
    userId: string;
    rawToken: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }) {
    const session = this.sessionsRepo.create({
      userId: data.userId,
      refreshTokenHash: this.hashToken(data.rawToken),
      expiresAt: data.expiresAt,
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
    });
    return this.sessionsRepo.save(session);
  }

  // Tìm session theo token đã được hash
  findByToken(rawToken: string) {
    return this.sessionsRepo.findOneBy({
      refreshTokenHash: this.hashToken(rawToken),
    });
  }

  // Xóa session theo token đã được hash khi người dùng đăng xuất
  deleteByToken(rawToken: string) {
    return this.sessionsRepo.delete({
      refreshTokenHash: this.hashToken(rawToken),
    });
  }
}
