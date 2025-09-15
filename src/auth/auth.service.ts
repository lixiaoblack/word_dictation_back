import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthCacheService } from './auth-cache.service';
import * as bcrypt from 'bcrypt';

export interface LoginResult {
  user: User;
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private authCacheService: AuthCacheService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async login(identifier: string, password: string): Promise<LoginResult> {
    // 检查用户是否已存在（通过手机号或邮箱）
    let user = await this.usersService.findOneByIdentifier(identifier);

    // 如果用户不存在，则创建新用户
    if (!user) {
      const hashedPassword = await this.hashPassword(password);
      user = await this.usersService.create({
        phone: identifier.includes('@') ? undefined : identifier,
        email: identifier.includes('@') ? identifier : undefined,
        password: hashedPassword,
        is_guest: false,
      });
    } else {
      // 如果用户存在，验证密码
      const isPasswordValid = await this.comparePasswords(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('密码错误');
      }
    }

    // 生成JWT token
    const payload = {
      sub: user.id,
      username: user.username || user.phone || user.email,
      uuid: user.uuid,
    };
    const token = this.jwtService.sign(payload);

    // 将用户信息和token存储到Redis缓存中
    await this.authCacheService.setUserToken(user.id, token);
    await this.authCacheService.setUserInfo(user.id, user);

    return { user, token };
  }

  async validateUserById(id: number): Promise<User | null> {
    return this.usersService.findOneById(id);
  }

  async logout(userId: number): Promise<void> {
    // 从Redis中移除用户的token和信息
    await this.authCacheService.removeUserToken(userId);
    await this.authCacheService.removeUserInfo(userId);
  }
}
