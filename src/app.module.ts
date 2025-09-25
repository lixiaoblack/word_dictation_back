/*
 * @Author: wanglx
 * @Date: 2025-09-02 22:24:37
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-15 14:03:19
 * @Description:
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImageRecognitionModule } from './image-recognition/image-recognition.module';
import { WordsModule } from './words/words.module';
import { DictationModule } from './dictation/dictation.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { UserDetail } from './users/entities/user-detail.entity';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { RedisModule } from './common/redis.module';
import { ExampleModule } from './example/example.module';
import { GlobalAuthGuard } from './auth/guards/global-auth.guard';
import { UploadModule } from './common/upload.module';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // 禁用自动同步
        logging: process.env.NODE_ENV !== 'production',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, UserDetail]),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
          },
          password: configService.get('REDIS_PASSWORD'),
          ttl: 60 * 60, // 默认缓存1小时
        }),
      }),
      inject: [ConfigService],
    }),
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          // 自定义文件名
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
    ImageRecognitionModule,
    WordsModule,
    DictationModule,
    AuthModule,
    RedisModule,
    ExampleModule,
    UploadModule,
  ],
  controllers: [AppController, UsersController],
  providers: [
    AppService,
    UsersService,
    JwtService,
    {
      provide: APP_GUARD,
      useClass: GlobalAuthGuard,
    },
  ],
})
export class AppModule {}
