import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // 启用CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8080',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 全局异常过滤器
  app.useGlobalFilters(new GlobalExceptionFilter());

  const urlPrefix = process.env.URL_PREFIX ?? '';

  // 设置全局路由前缀
  app.setGlobalPrefix(urlPrefix);

  const port = process.env.PORT ?? 3000;

  // 配置Swagger文档
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('英文学习助手 API')
      .setDescription(
        `
        一个强大的英文学习后台服务，提供图片文字识别和英文单词分析功能。
        
        **主要功能：**
        - 📸 图片文字识别：支持豆包和DeepSeek AI提供商
        - 🔤 英文单词分析：提供音标、翻译、词性等详细信息
        - 🌐 RESTful API：完整的API接口设计
        
        **支持的AI提供商：**
        - **豆包 (推荐)**：对中英文混合文本识别准确率高
        - **DeepSeek**：文本理解能力强，分析详细
        
        **使用说明：**
        1. 配置环境变量中的API密钥
        2. 上传图片或输入文本进行处理
        3. 获取结构化的单词分析结果
      `,
      )
      .setVersion('1.0.0')
      .setContact(
        '开发团队',
        'https://github.com/your-repo',
        'contact@example.com',
      )
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .addTag('健康检查', '服务状态检查相关接口')
      .addTag('图片识别', '图片文字识别和文本处理相关接口')
      .addServer('http://localhost:3000', '开发环境')
      .addServer('https://api.example.com', '生产环境')
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      operationIdFactory: (controllerKey: string, methodKey: string) =>
        methodKey,
    });

    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'list',
        filter: true,
        showRequestHeaders: true,
      },
      customSiteTitle: '英文学习助手 API 文档',
      customfavIcon: 'https://nestjs.com/img/logo_text.svg',
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
      ],
      customCssUrl: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      ],
    });

    logger.log(
      `Swagger documentation available at: http://localhost:${port}/api/docs`,
    );
  }
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`API documentation available at: http://localhost:${port}/api`);
}
bootstrap();
