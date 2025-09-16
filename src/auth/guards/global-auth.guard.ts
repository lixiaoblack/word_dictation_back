import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { AuthCacheService } from '../auth-cache.service';

@Injectable()
export class GlobalAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService,
    private authService: AuthService,
    private authCacheService: AuthCacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 检查是否有@Public装饰器，如果有则允许访问
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      return false;
    }

    try {
      // 验证JWT token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET') || 'your-secret-key',
      });

      // 验证用户是否仍然有效
      const user = await this.authService.validateUserById(payload.sub);
      if (!user) {
        return false;
      }

      // 从Redis中验证token是否仍然有效（可选的额外安全检查）
      const storedToken = await this.authCacheService.getUserToken(payload.sub);
      if (storedToken !== token) {
        return false;
      }

      // 将用户信息附加到请求对象
      request.user = user;
      request.userId = payload.sub;
      request.userPayload = payload;
    } catch (error) {
      return false;
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
