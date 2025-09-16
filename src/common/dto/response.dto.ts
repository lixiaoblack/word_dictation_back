import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T = any> {
  @ApiProperty({
    description: '响应状态码',
    example: 200,
  })
  code: number;

  @ApiProperty({
    description: '响应数据',
    nullable: true,
  })
  data?: T;

  @ApiProperty({
    description: '错误信息',
    example: '操作成功',
    nullable: true,
  })
  errmsg?: string;

  constructor(code: number, data?: T, errmsg?: string) {
    this.code = code;
    this.data = data;
    this.errmsg = errmsg;
  }
}
