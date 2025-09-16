import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TokenInfo = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    // 如果请求中已经有解析的用户信息，直接返回
    if (request.user) {
      return data ? request.user[data] : request.user;
    }

    // 如果有userPayload（来自守卫），返回它
    if (request.userPayload) {
      return data ? request.userPayload[data] : request.userPayload;
    }

    // 否则返回null
    return null;
  },
);
