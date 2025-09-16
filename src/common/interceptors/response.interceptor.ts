import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from '../dto/response.dto';

export interface Response<T> {
  data: T;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseDto<T>> {
    return next.handle().pipe(
      map((data) => {
        // 如果已经是ResponseDto格式，直接返回
        if (data instanceof ResponseDto) {
          return data;
        }

        // 如果是布尔值且为false，表示操作失败
        if (data === false) {
          return new ResponseDto(500, null, '操作失败');
        }

        // 如果是布尔值且为true，表示操作成功但无数据返回
        if (data === true) {
          return new ResponseDto(200, null, undefined);
        }

        // 默认成功响应
        return new ResponseDto(200, data, undefined);
      }),
    );
  }
}
