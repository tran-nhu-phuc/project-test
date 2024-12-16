import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { UserService } from '../users/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from '../tokens/refresh-token.entity';
import { Token } from '../tokens/token.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private userService: UserService,
  ) {}

  async login(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { email: user.email, sub: user.id };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const userToken = this.tokenRepository.create({ token: accessToken, user });
    await this.tokenRepository.save(userToken);

    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const userRefreshToken = this.refreshTokenRepository.create({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      user,
    });
    await this.refreshTokenRepository.save(userRefreshToken);

    return { accessToken, refreshToken };
  }

  async signUp(createUserData: any): Promise<void> {
    const { email, password } = createUserData;

    const userExist = await this.userService.getUserByEmail(email);

    if (userExist) {
      throw new UnauthorizedException('MSG_ERROR.EMAIL_EXIST_ERROR');
    }

    const hashPassword = await bcrypt.hash(password, 9);

    const newUser = new User();
    newUser.email = email;
    newUser.password = hashPassword;

    await this.userRepository.save(newUser);
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    const refreshTokenEntity = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken, isActive: true },
    });

    if (!refreshTokenEntity || refreshTokenEntity.expiresAt < new Date()) {
      throw new Error('Refresh Token không hợp lệ hoặc đã hết hạn.');
    }

    const payload = this.jwtService.verify(refreshToken);
    const newAccessToken = this.jwtService.sign(
      { email: payload.email, sub: payload.sub },
      { expiresIn: '15m' },
    );

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });
    const newToken = this.tokenRepository.create({
      token: newAccessToken,
      user,
    });
    await this.tokenRepository.save(newToken);

    return { accessToken: newAccessToken };
  }

  async logout(accessToken: string, refreshToken: string): Promise<string> {
    const tokenEntity = await this.tokenRepository.findOne({
      where: { token: accessToken },
    });
    if (tokenEntity) {
      tokenEntity.isActive = false;
      await this.tokenRepository.save(tokenEntity);
    }

    const refreshTokenEntity = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });
    if (refreshTokenEntity) {
      refreshTokenEntity.isActive = false;
      await this.refreshTokenRepository.save(refreshTokenEntity);
    }

    return '.....';
  }
}
