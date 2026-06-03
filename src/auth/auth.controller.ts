import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @HttpCode(204)
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Post('signin')
  signIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return this.authService.signIn(dto, res, req);

  }

  @Post('signout')
  @HttpCode(204)
  signOut(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refreshToken;
    return this.authService.signOut(token, res);
  }

  @Post('refresh')
  refresh(@Req() req: Request) {
    const token = req.cookies?.refreshToken;
    return this.authService.refresh(token);
  }
}
