---
trigger: always_on
alwaysApply: true
---
# Qoder 规则 - 英文学习助手后端项目

## 项目概述
这是一个基于NestJS的后端项目，用于英文学习助手应用，提供图片文字识别和英文单词分析功能。

## 代码风格规范

### 1. 文件结构规范
```
src/
├── auth/                 # 认证模块
├── common/               # 公共模块
│   ├── dto/              # 公共DTO
│   ├── filters/          # 公共过滤器
│   ├── interceptors/      # 公共拦截器
│   ├── services/         # 公共服务
│   └── controllers/      # 公共控制器
├── users/                # 用户模块
├── image-recognition/    # 图片识别模块
├── types/                # 全局类型定义
└── dto/                  # 全局DTO导出
```

### 2. 命名规范
- 文件名：使用 kebab-case（短横线分隔）
- 类名：使用 PascalCase（大驼峰）
- 方法名：使用 camelCase（小驼峰）
- 变量名：使用 camelCase（小驼峰）
- 常量名：使用 UPPER_SNAKE_CASE（大写下划线分隔）

### 3. 注释规范
- 文件头部注释：
```typescript
/*
 * @Author: wanglx
 * @Date: 2025-09-02 22:24:37
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-15 14:03:19
 * @Description:
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
```

### 4. 导入规范
- 按功能分组导入，顺序为：
  1. NestJS核心模块
  2. 第三方库
  3. 项目内部模块
- 使用绝对路径导入项目内部模块
- 使用pnpm安装依赖

### 5. DTO规范
- 所有DTO类必须使用 `@ApiProperty` 装饰器标注Swagger文档
- 使用 class-validator 进行数据验证
- 请求DTO类名以 `Dto` 结尾
- 响应DTO类名以 `ResponseDto` 结尾

### 6. 控制器规范
- 控制器类名以 `Controller` 结尾
- 使用 Swagger 装饰器标注API文档
- 所有接口返回统一的 [ResponseDto](file:///Users/wanglixiao/Desktop/AI/en-study/en-study-backend/src/common/dto/response.dto.ts#L4-L26) 格式：`{code, data, errmsg}`
- 使用 `@ApiBearerAuth()` 标注需要认证的接口

### 7. 服务规范
- 服务类名以 `Service` 结尾
- 使用 `Logger` 进行日志记录
- 方法名清晰表达功能意图
- 异常处理使用 try-catch 结构

### 8. 实体规范
- 实体类名以 `Entity` 结尾（在文件名中）
- 使用 TypeORM 装饰器定义表结构
- 使用 `@CreateDateColumn()` 和 `@UpdateDateColumn()` 自动管理时间戳
- 数据库创建不创建外链，通过代码进行管理

### 9. 模块规范
- 模块类名以 `Module` 结尾
- 明确区分 imports、controllers、providers
- 使用 forRoot、forFeature 等模式进行模块配置

## 技术栈规范

### 1. 核心框架
- NestJS v11.x
- TypeScript v5.x

### 2. 数据库
- MySQL 8.x
- TypeORM v0.3.x

### 3. 缓存
- Redis
- cache-manager v7.x

### 4. 认证
- JWT
- Passport.js

### 5. 文件上传
- Multer
- 阿里云OSS

### 6. API文档
- Swagger/OpenAPI v3

## 环境配置规范

### 1. 环境变量
- 使用 `.env` 文件配置环境变量
- 提供 `.env.example` 示例文件
- 敏感信息不应提交到版本控制

### 2. 配置项
```
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=en_study

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT密钥
JWT_SECRET=your-super-secret-jwt-key-here
```

## 错误处理规范

### 1. 统一响应格式
所有接口必须返回统一格式：
```json
{
  "code": 200,
  "data": {},
  "errmsg": "操作成功"
}
```

### 2. 异常处理
- 使用全局异常过滤器处理未捕获异常
- 业务异常使用 HttpException
- 记录错误日志便于排查问题

## 测试规范

### 1. 单元测试
- 使用 Jest 框架
- 测试文件以 `.spec.ts` 结尾
- 覆盖核心业务逻辑

### 2. 端到端测试
- 使用 Supertest 进行HTTP请求测试
- 测试主要API接口

## 部署规范

### 1. 构建
- 使用 `npm run build` 进行构建
- 输出到 `dist/` 目录

### 2. 启动
- 开发环境：`npm run start:dev`
- 生产环境：`npm run start:prod`

## 代码质量规范

### 1. 代码检查
- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化

### 2. 类型安全
- 启用 TypeScript 严格模式
- 避免使用 any 类型
- 明确函数返回类型

## Qoder 使用指南

### 1. 代码生成
当需要创建新模块时，遵循以下步骤：
1. 创建模块目录：`src/module-name/`
2. 创建实体文件：`src/module-name/entities/*.entity.ts`
3. 创建DTO文件：`src/module-name/dto/*.dto.ts`
4. 创建服务文件：`src/module-name/*.service.ts`
5. 创建控制器文件：`src/module-name/*.controller.ts`
6. 创建模块文件：`src/module-name/*.module.ts`

### 2. API开发流程
1. 定义DTO（数据传输对象）
2. 实现服务逻辑
3. 创建控制器并标注Swagger文档
4. 在模块中注册控制器和服务
5. 在AppModule中导入新模块
6. 编写测试用例

### 3. 错误处理
1. 优先使用自定义业务异常
2. 使用统一的响应格式返回错误信息
3. 记录必要的错误日志
4. 避免将敏感信息暴露给客户端

### 4. 最佳实践
1. 保持控制器轻量，业务逻辑放在服务中
2. 使用依赖注入管理服务依赖
3. 合理使用缓存提高性能
4. 遵循RESTful API设计原则
5. 保证API文档的准确性和完整性