import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImageRecognitionModule } from './image-recognition/image-recognition.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
    ImageRecognitionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
