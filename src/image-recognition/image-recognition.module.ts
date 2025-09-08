import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ImageRecognitionController } from './image-recognition.controller';
import { ImageRecognitionService } from './image-recognition.service';
import { DoubaoService } from '../ai-providers/doubao.service';
import { DeepSeekService } from '../ai-providers/deepseek.service';
import { TranslationService } from '../translation/translation.service';

@Module({
  imports: [ConfigModule],
  controllers: [ImageRecognitionController],
  providers: [
    ImageRecognitionService,
    DoubaoService,
    DeepSeekService,
    TranslationService,
  ],
  exports: [ImageRecognitionService],
})
export class ImageRecognitionModule {}
