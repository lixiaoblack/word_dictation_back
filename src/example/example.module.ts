import { Module } from '@nestjs/common';
import { ExampleService } from './example.service';
import { RedisModule } from '../common/redis.module';

@Module({
  imports: [RedisModule],
  providers: [ExampleService],
  exports: [ExampleService],
})
export class ExampleModule {}
