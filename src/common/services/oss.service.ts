/*
 * @Author: wanglx
 * @Date: 2025-09-16 18:09:52
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-24 22:50:00
 * @Description:
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import { Injectable, Logger } from '@nestjs/common';
import OSS from 'ali-oss';
import { OssConfig } from '../../types/oss-config.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OssService {
  private readonly logger = new Logger(OssService.name);
  private client: OSS;

  constructor(private readonly configService: ConfigService) {
    this.initClient();
  }

  private initClient() {
    try {
      const config: OssConfig = {
        region: this.configService.get<string>('OSS_REGION', 'oss-cn-hangzhou'),
        accessKeyId: this.configService.get<string>('OSS_ACCESS_KEY_ID', ''),
        accessKeySecret: this.configService.get<string>(
          'OSS_ACCESS_KEY_SECRET',
          '',
        ),
        bucket: this.configService.get<string>('OSS_BUCKET', ''),
      };

      this.client = new OSS({
        region: config.region,
        accessKeyId: config.accessKeyId,
        accessKeySecret: config.accessKeySecret,
        bucket: config.bucket,
      });

      this.logger.log('OSS客户端初始化成功');
    } catch (error) {
      this.logger.error('OSS客户端初始化失败:', error);
      throw error;
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    fileName?: string,
    folder?: string,
  ): Promise<string> {
    try {
      // 如果没有提供文件名，则生成一个唯一的文件名
      const baseName = fileName || `${Date.now()}-${file.originalname}`;

      // 构建完整的文件路径（包含文件夹）
      const fullPath = folder ? `${folder}/${baseName}` : baseName;

      // 上传文件
      const result = await this.client.put(fullPath, file.buffer);

      this.logger.log(`文件上传成功: ${result.name}`);
      return result.url;
    } catch (error) {
      this.logger.error('文件上传失败:', error);
      throw error;
    }
  }

  async uploadBase64(
    base64Data: string,
    fileName: string,
    folder?: string,
  ): Promise<string> {
    try {
      // 移除base64数据URL前缀（如果存在）
      const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, '');

      // 将base64转换为Buffer
      const buffer = Buffer.from(base64Content, 'base64');

      // 构建完整的文件路径（包含文件夹）
      const fullPath = folder ? `${folder}/${fileName}` : fileName;

      // 上传文件
      const result = await this.client.put(fullPath, buffer);

      this.logger.log(`Base64文件上传成功: ${result.name}`);
      return result.url;
    } catch (error) {
      this.logger.error('Base64文件上传失败:', error);
      throw error;
    }
  }
}
