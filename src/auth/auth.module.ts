/*
 * @Author: wanglx
 * @Date: 2025-09-15 18:12:36
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-15 18:25:17
 * @Description:
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthCacheService } from './auth-cache.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../users/entities/user.entity';
import { UserDetail } from '../users/entities/user-detail.entity';
import { UsersService } from '../users/users.service';
import { RedisModule } from '../common/redis.module';
import { AuthGuard } from './guards/auth.guard';
import { TokenUtils } from './token.utils';
import { GlobalAuthGuard } from './guards/global-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserDetail]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthCacheService,
    UsersService,
    JwtStrategy,
    AuthGuard,
    TokenUtils,
    GlobalAuthGuard,
  ],
  exports: [
    AuthService,
    AuthCacheService,
    AuthGuard,
    TokenUtils,
    GlobalAuthGuard,
  ],
})
export class AuthModule {}
