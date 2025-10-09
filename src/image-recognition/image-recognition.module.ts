import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ImageRecognitionController } from './image-recognition.controller';
import { ImageRecognitionService } from './image-recognition.service';
import { EnhancedRecognitionService } from './enhanced-recognition.service';
import { DoubaoService } from '../ai-providers/doubao.service';
import { DeepSeekService } from '../ai-providers/deepseek.service';
import { TranslationService } from '../translation/translation.service';
import { WordsModule } from '../words/words.module';
import { TtsModule } from '../tts/tts.module';

@Module({
  imports: [ConfigModule, WordsModule, TtsModule],
  controllers: [ImageRecognitionController],
  providers: [
    ImageRecognitionService,
    EnhancedRecognitionService,
    DoubaoService,
    DeepSeekService,
    TranslationService,
  ],
  exports: [ImageRecognitionService, EnhancedRecognitionService],
})
export class ImageRecognitionModule {}
