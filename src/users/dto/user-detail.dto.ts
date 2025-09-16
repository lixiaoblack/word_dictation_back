import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class UserDetailDto {
  @ApiProperty({ description: '用户名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: '年纪',
    required: false,
    minimum: 1,
    maximum: 150,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(150)
  age?: number;

  @ApiProperty({ description: '性别', required: false })
  @IsOptional()
  @IsString()
  sex?: string;

  @ApiProperty({ description: '头像', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: '年级', required: false })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiProperty({ description: '班级', required: false })
  @IsOptional()
  @IsString()
  class?: string;

  @ApiProperty({ description: '学校', required: false })
  @IsOptional()
  @IsString()
  school?: string;
}
