import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserDetail } from './entities/user-detail.entity';
import { v4 as uuidv4 } from 'uuid';
import { UpdateUserDetailDto } from './dto/update-user-detail.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserDetail)
    private userDetailRepository: Repository<UserDetail>,
  ) {}

  async findOneById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findOneByPhone(phone: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { phone } });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findOneByIdentifier(identifier: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: [{ phone: identifier }, { email: identifier }],
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create({
      ...userData,
      uuid: uuidv4(),
    });
    return this.usersRepository.save(user);
  }

  async getUserDetail(userId: number): Promise<UserDetail | null> {
    return this.userDetailRepository.findOne({ where: { userId } });
  }

  async updateUserDetail(
    userId: number,
    updateUserDetailDto: UpdateUserDetailDto,
  ): Promise<UserDetail> {
    // 查找现有的用户详情，如果不存在则创建一个新的
    let userDetail = await this.userDetailRepository.findOne({
      where: { userId },
    });

    if (!userDetail) {
      userDetail = new UserDetail();
      userDetail.userId = userId;
    }

    // 更新用户详情
    Object.assign(userDetail, updateUserDetailDto);

    return this.userDetailRepository.save(userDetail);
  }
}
