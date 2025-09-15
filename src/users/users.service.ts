import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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
}
