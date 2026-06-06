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
import { SessionsService } from '../modules/session/seisson.service';

const ACCESS_TOKEN_TTL: any = process.env.ACCESS_TOKEN_TTL;
const REFRESH_TOKEN_TTL_MS = 14 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private sessionsService: SessionsService,
  ) {}

  async signUp(dto: SignUpDto) {
    const existing = await this.usersService.findByUsername(dto.username);
    if (existing) throw new ConflictException('Username đã tồn tại');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.usersService.create({
      username: dto.username,
      hashedPassword,
      email: dto.email,
      displayName: `${dto.firstName} ${dto.lastName}`,
    });
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

    // Tạo access token
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.ACCESS_TOKEN_SECRET || 'default_secret',
      { expiresIn: ACCESS_TOKEN_TTL },
    );
      console.log(accessToken)

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
    res.cookie('refreshToken', rawRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
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

  async refresh(rawToken: string) {
      // Kiểm tra token tồn tại
    if (!rawToken) throw new UnauthorizedException('Token không tồn tại');

    // Tìm session theo token
    const session = await this.sessionsService.findByToken(rawToken);
    if (!session)
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Token đã hết hạn');
    }

    // Tạo access token mới
    return jwt.sign(
      { userId: session.userId },
      process.env.ACCESS_TOKEN_SECRET || 'default_secret',
      { expiresIn: ACCESS_TOKEN_TTL },
    );
  }
}
