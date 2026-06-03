import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../modules/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
      // Cấu hình chiến lược JWT
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ACCESS_TOKEN_SECRET || 'default_secret',
      ignoreExpiration: false,
    });
  }

  // Hàm validate sẽ được gọi sau khi token được xác thực thành công
  async validate(payload: { userId: string }) {
      // Tìm user theo ID trong payload của token
    const user = await this.usersService.findById(payload.userId);
    if (!user) throw new UnauthorizedException('Người dùng không tồn tại');
    return user;
  }
}
