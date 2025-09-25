#!/usr/bin/env node

/*
 * @Author: wanglx
 * @Date: 2025-09-24 16:30:00
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-24 16:30:00
 * @Description: 修复单词表唯一索引约束脚本
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */

const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
  host: '119.45.129.229',
  port: 3306,
  user: 'en_study',
  password: 'root123!',
  database: 'en_study',
};

async function fixWordUniqueConstraint() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('连接到数据库成功');

    // 1. 检查现有索引
    console.log('检查现有索引...');
    const [indexes] = await connection.execute(`
      SHOW INDEX FROM words WHERE Key_name = 'IDX_word' OR Key_name = 'IDX_word_book'
    `);

    console.log('现有索引:', indexes);

    // 2. 删除旧的唯一索引（如果存在）
    try {
      console.log('尝试删除旧的唯一索引 IDX_word...');
      await connection.execute('DROP INDEX IDX_word ON words');
      console.log('成功删除索引 IDX_word');
    } catch (error) {
      if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('索引 IDX_word 不存在，跳过删除');
      } else {
        console.error('删除索引时出错:', error.message);
      }
    }

    // 3. 检查是否已存在复合唯一索引
    const [existingCompositeIndex] = await connection.execute(`
      SHOW INDEX FROM words WHERE Key_name = 'IDX_word_book'
    `);

    if (existingCompositeIndex.length === 0) {
      // 4. 创建新的复合唯一索引
      console.log('创建新的复合唯一索引...');
      await connection.execute(`
        CREATE UNIQUE INDEX IDX_word_book ON words (word, book_id)
      `);
      console.log('成功创建复合唯一索引 IDX_word_book');
    } else {
      console.log('复合唯一索引 IDX_word_book 已存在');
    }

    // 5. 检查是否还需要普通索引
    const [wordIndexExists] = await connection.execute(`
      SHOW INDEX FROM words WHERE Key_name = 'IDX_4e6cd2b66dc9b22b95b3d27bd21cbac1'
    `);

    if (wordIndexExists.length === 0) {
      console.log('创建单词字段普通索引...');
      await connection.execute(`
        CREATE INDEX IDX_4e6cd2b66dc9b22b95b3d27bd21cbac1 ON words (word)
      `);
      console.log('成功创建单词字段普通索引');
    } else {
      console.log('单词字段普通索引已存在');
    }

    // 6. 验证修改结果
    console.log('验证修改结果...');
    const [finalIndexes] = await connection.execute(`
      SHOW INDEX FROM words
    `);

    console.log('最终索引结构:');
    finalIndexes.forEach((index) => {
      console.log(
        `- ${index.Key_name}: ${index.Column_name} (unique: ${index.Non_unique === 0})`,
      );
    });

    console.log('数据库唯一索引修复完成！');
  } catch (error) {
    console.error('修复过程中出现错误:', error);
  } finally {
    await connection.end();
  }
}

// 执行修复
fixWordUniqueConstraint().catch(console.error);
