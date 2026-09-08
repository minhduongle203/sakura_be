import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { Request, Response } from 'express';
import { UsersService } from '../modules/user/user.service';
import { SessionsService } from '../modules/session/session.service';

const ACCESS_TOKEN_TTL: any = process.env.ACCESS_TOKEN_TTL ?? '15m';
const REFRESH_TOKEN_TTL_MS = 14 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private sessionsService: SessionsService,
  ) {}

  async signUp(dto: SignUpDto) {
    const existingUsername = await this.usersService.findByUsername(dto.username);
    if (existingUsername) throw new ConflictException('Username đã tồn tại');

    const existingEmail = await this.usersService.findByEmail(dto.email);
    if (existingEmail) throw new ConflictException('Email đã được sử dụng');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const data = {
        username: dto.username,
        hashedPassword,
        email: dto.email,
        displayName: `${dto.firstName} ${dto.lastName}`,
    }
    await this.usersService.create(data);
  }

  async signIn(dto: SignInDto, res: Response, req: Request) {

      // Tìm user theo username
      const user = await this.usersService.findByUsername(dto.username);
    if (!user)
      throw new UnauthorizedException('Username hoặc password không chính xác');

    // So sánh password đã hash với password nhập vào
    const match = await bcrypt.compare(dto.password, user.hashedPassword);
    if (!match)
      throw new UnauthorizedException('Username hoặc password không chính xác');

    // Cập nhật thời điểm đăng nhập gần nhất
    await this.usersService.updateLastLogin(user.id);

    // Tạo access token
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.ACCESS_TOKEN_SECRET || 'default_secret',
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    // Tạo refresh token và lưu vào database
    const rawRefreshToken = crypto.randomBytes(64).toString('hex');

    // Lưu session vào database
    await this.sessionsService.create({
      userId: user.id,
      rawToken: rawRefreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    // Gửi refresh token về client qua cookie
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', rawRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: REFRESH_TOKEN_TTL_MS,
    });

    return { message: `User ${user.displayName} đã logged in!`, accessToken };
  }

    async signOut(rawToken: string, res: Response) {
        if (!rawToken) {
            throw new UnauthorizedException('Không tìm thấy refresh token');
        }
        await this.sessionsService.deleteByToken(rawToken);
        res.clearCookie('refreshToken');

        return { message: 'Đã logged out' };
    }

  async refresh(rawToken: string, res: Response) {
      // Kiểm tra token tồn tại
    if (!rawToken) throw new UnauthorizedException('Token không tồn tại');

    // Tìm session theo token
    const session = await this.sessionsService.findByToken(rawToken);
    if (!session)
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Token đã hết hạn');
    }

    // Xoay vòng refresh token: hủy session cũ, phát hành token mới
    // để nếu token cũ từng bị lộ thì cũng không dùng lại được nữa
    await this.sessionsService.deleteByToken(rawToken);

    const newRawRefreshToken = crypto.randomBytes(64).toString('hex');
    await this.sessionsService.create({
      userId: session.userId,
      rawToken: newRawRefreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
    });

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', newRawRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: REFRESH_TOKEN_TTL_MS,
    });

    // Tạo access token mới
    const accessToken = jwt.sign(
      { userId: session.userId },
      process.env.ACCESS_TOKEN_SECRET || 'default_secret',
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    return { accessToken };
  }
}
