import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenUtils {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * 从请求头中提取token
   * @param request HTTP请求对象
   * @returns token字符串或undefined
   */
  extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  /**
   * 解析token获取payload信息（不验证有效性）
   * @param token JWT token
   * @returns token payload或null
   */
  decodeToken(token: string): any | null {
    try {
      return this.jwtService.decode(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * 验证token有效性
   * @param token JWT token
   * @returns 验证结果和payload
   */
  async verifyToken(
    token: string,
  ): Promise<{ valid: boolean; payload?: any; error?: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET') || 'your-secret-key',
      });
      return { valid: true, payload };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * 从请求中获取用户信息（不进行完整验证）
   * @param request HTTP请求对象
   * @returns 用户信息或null
   */
  getUserInfoFromRequest(request: any): any | null {
    // 如果请求中已经有解析的用户信息，直接返回
    if (request.user) {
      return request.user;
    }

    // 否则尝试从token中解析
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      return null;
    }

    return this.decodeToken(token);
  }
}
