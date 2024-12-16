import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auths.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body) {
    return await this.authService.login(body.user);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return await this.authService.refresh(refreshToken);
  }

  @Post('logout')
  async logout(@Req() req) {
    const accessToken = req.headers.authorization.split(' ')[1];
    const refreshToken = req.body.refreshToken;
    return await this.authService.logout(accessToken, refreshToken);
  }
}
