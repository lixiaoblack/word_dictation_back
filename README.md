# 英文学习后台服务

一个基于NestJS的英文学习后台服务，支持图片文字识别和英文单词分析。

## 功能特性

- 📸 **图片文字识别**: 支持豆包和DeepSeek两种AI提供商
- 🔤 **英文单词分析**: 提供音标、翻译、词性、释义等详细信息
- 🌐 **RESTful API**: 完整的API接口设计
- 📚 **Swagger文档**: 完整的API文档和在线测试界面
- ⚡ **高性能**: 并发处理和智能缓存
- 🛡️ **错误处理**: 完善的异常处理机制

## 环境要求

- Node.js >= 16.0.0
- pnpm >= 8.0.0

## 安装和运行

1. 安装依赖：
```bash
pnpm install
```

2. 配置环境变量：
复制 `.env` 文件并填入相应的API密钥：

```bash
# 豆包API配置
DOUBAO_API_KEY=your_doubao_api_key_here
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3

# DeepSeek API配置  
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com

# 有道翻译API配置（可选，用于获取更准确的音标）
YOUDAO_APP_KEY=your_youdao_app_key_here
YOUDAO_APP_SECRET=your_youdao_app_secret_here

# 服务配置
PORT=3000
NODE_ENV=development
```

3. 启动服务：
```bash
# 开发模式
pnpm run start:dev

# 生产模式
pnpm run build
pnpm run start:prod
```

4. 访问API文档：
打开浏览器访问 http://localhost:3000/api/docs 查看完整的API文档和在线测试界面。

## API接口

### 在线文档
- **Swagger UI**: http://localhost:3000/api/docs
- **JSON Schema**: http://localhost:3000/api/docs-json

### 主要端点

#### 健康检查
```
GET /api/health
```

#### 图片文字识别
```
POST /api/recognition/upload
Content-Type: multipart/form-data

参数：
- image: 图片文件 (支持 JPEG, PNG, JPG, WebP，最大10MB)
- provider: AI提供商 (doubao | deepseek，默认 doubao)
```

#### 文本处理
```
POST /api/recognition/text
参数：
- text: 要处理的文本
- provider: AI提供商 (doubao | deepseek，默认 doubao)
```

### 响应格式
```json
{
  "success": true,
  "data": {
    "originalText": "Hello world",
    "words": [
      {
        "word": "hello",
        "phonetic": "/həˈloʊ/",
        "translation": "你好",
        "partOfSpeech": "感叹词",
        "definitions": ["用于问候"],
        "examples": ["Hello, how are you?"]
      }
    ],
    "confidence": 85,
    "provider": "doubao"
  },
  "message": "处理成功"
}
```

## 推荐的AI服务提供商

### 豆包 (推荐)
- **优势**: 对中英文混合文本识别准确率高，访问稳定
- **适用**: 图片文字识别 + 文本分析
- **获取**: [豆包开放平台](https://www.volcengine.com/product/doubao)

### DeepSeek
- **优势**: 文本理解能力强，分析详细
- **适用**: 主要用于文本分析
- **获取**: [DeepSeek开放平台](https://platform.deepseek.com/)

### 有道翻译 (辅助)
- **优势**: 提供准确的音标和词典释义
- **适用**: 增强翻译质量
- **获取**: [有道智云](https://ai.youdao.com/)

## 开发说明

项目结构：
```
src/
├── ai-providers/          # AI服务提供商
│   ├── doubao.service.ts
│   └── deepseek.service.ts
├── image-recognition/     # 图片识别模块
│   ├── image-recognition.controller.ts
│   ├── image-recognition.service.ts
│   └── image-recognition.module.ts
├── translation/           # 翻译服务
│   └── translation.service.ts
├── filters/              # 全局过滤器
│   └── global-exception.filter.ts
├── types/                # 类型定义
│   └── index.ts
├── app.module.ts
└── main.ts
```

### 🎯 核心技术栈

- **框架**: NestJS
- **语言**: TypeScript
- **文档**: Swagger/OpenAPI 3.0
- **文件上传**: Multer
- **HTTP客户端**: Axios
- **配置管理**: @nestjs/config
- **验证**: class-validator, class-transformer

### 📚 文档特性

- 📖 **完整的API文档**: 基于OpenAPI 3.0规范
- 🧪 **在线测试**: 直接在浏览器中测试API
- 📝 **详细描述**: 每个接口都有详细的说明和示例
- 🏷️ **标签分类**: API按功能模块进行分类
- 📊 **数据模型**: 完整的请求/响应数据结构
- 🔍 **搜索过滤**: 快速查找和过滤API接口

## 许可证

MIT License