import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: '手机号或邮箱',
    example: '13800138000 或 user@example.com',
  })
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @ApiProperty({
    description: '密码',
    example: 'password123',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
