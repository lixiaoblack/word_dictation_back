import { PartialType } from '@nestjs/swagger';
import { UserDetailDto } from './user-detail.dto';

export class UpdateUserDetailDto extends PartialType(UserDetailDto) {}
