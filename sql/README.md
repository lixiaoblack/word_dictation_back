# 数据库建表语句文档

## 概述

本目录包含英语学习系统所有数据库表的建表语句，按功能模块组织。

## 文件列表

### 0. 完整建表脚本
- **文件**: `create_all_tables.sql`
- **说明**: 包含所有模块的完整建表语句，可一次性执行创建所有表
- **包含表**: 13个表（所有模块）

### 1. 用户管理模块
- **文件**: `create_users_tables.sql`
- **包含表**:
  - `users` - 用户主表
  - `user_detail` - 用户详情表

### 2. 单词管理模块
- **文件**: `create_words_tables.sql`
- **包含表**:
  - `word_books` - 单词书表
  - `words` - 单词主表
  - `word_translations` - 单词翻译表
  - `word_phrases` - 单词短语表
  - `word_sentences` - 单词例句表
  - `word_synonyms` - 单词近义词表
  - `word_related_words` - 单词同根词表

### 3. 听写管理模块
- **文件**: `create_dictation_tables.sql`
- **包含表**:
  - `dictation_records` - 听写记录表
  - `dictation_words` - 听写单词表
  - `wrong_words` - 错题本表

### 4. TTS音频存储模块
- **文件**: `create_tts_audio_records_table.sql`
- **包含表**:
  - `tts_audio_records` - TTS音频记录表

### 5. 图片识别模块（已废弃）
- **文件**: `create_recognition_words_table.sql`
- **包含表**:
  - `recognition_words` - 图片识别简化单词表（已废弃）

## 表关系说明

### 单词数据关系
```
word_books (单词书)
    ↓ (book_id)
words (单词主表)
    ↓ (word_id)
├── word_translations (翻译)
├── word_phrases (短语)
├── word_sentences (例句)
├── word_synonyms (近义词)
└── word_related_words (同根词)
```

### 听写功能关系
```
users (用户)
    ↓ (user_id)
dictation_records (听写记录)
    ↓ (dictation_record_id)
├── dictation_words (听写单词)
└── wrong_words (错题本)
```

### TTS音频关系
```
users (用户)
    ↓ (created_by)
tts_audio_records (TTS音频记录)
```

## 数据库设计原则

1. **第三范式**: 单词数据拆分为多个关联表，避免重复存储
2. **唯一性约束**: 同一单词可在不同单词书中重复，使用 word + book_id 组合键
3. **索引优化**: 为常用查询字段添加索引
4. **数据完整性**: 使用外键约束和枚举类型确保数据完整性

## 执行顺序

### 方式一：一次性创建所有表

直接执行完整建表脚本：

```sql
source sql/create_all_tables.sql
```

### 方式二：按模块分步骤创建

建议按以下顺序执行建表语句：

1. `create_users_tables.sql` - 用户相关表
2. `create_words_tables.sql` - 单词相关表  
3. `create_dictation_tables.sql` - 听写相关表
4. `create_tts_audio_records_table.sql` - TTS音频表

## 注意事项

- 所有表使用 `utf8mb4_unicode_ci` 字符集，支持完整的UTF-8字符
- 时间字段统一使用 `datetime(6)` 类型，支持微秒精度
- 布尔字段使用 `tinyint(1)` 类型
- JSON字段用于存储复杂数据结构（听写单词详情等）

## 更新历史

- 2025-10-09: 整理所有建表语句到sql文件夹
- 2025-10-09: 添加TTS音频存储表
- 2025-09-25: 添加听写管理相关表
- 2025-09-24: 完善单词管理表结构