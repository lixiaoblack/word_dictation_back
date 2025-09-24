import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SwaggerAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 只对Swagger相关路由进行认证
    if (
      req.path.startsWith('/api/docs') ||
      req.path.startsWith('/api/static')
    ) {
      const authHeader = req.headers.authorization;

      // 如果没有Authorization头，返回401并要求认证
      if (!authHeader) {
        res.setHeader(
          'WWW-Authenticate',
          'Basic realm="Swagger Documentation"',
        );
        return res.status(401).send('Authentication required.');
      }

      // 解析Basic认证
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString(
        'ascii',
      );
      const [username, password] = credentials.split(':');

      // 从环境变量获取认证信息
      const swaggerUsername = process.env.SWAGGER_USERNAME || 'admin';
      const swaggerPassword = process.env.SWAGGER_PASSWORD || 'admin123';

      // 验证用户名和密码
      if (username === swaggerUsername && password === swaggerPassword) {
        return next();
      } else {
        res.setHeader(
          'WWW-Authenticate',
          'Basic realm="Swagger Documentation"',
        );
        return res.status(401).send('Invalid credentials.');
      }
    }

    // 非Swagger路由直接通过
    next();
  }
}
