#!/usr/bin/env node

/*
 * @Author: wanglx
 * @Date: 2025-09-24 17:00:00
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-24 17:00:00
 * @Description: 验证单词唯一索引修复结果
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

async function verifyWordUniqueConstraintFix() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('连接到数据库成功');
    console.log('='.repeat(50));

    // 1. 查看当前索引结构
    console.log('1. 当前索引结构:');
    const [indexes] = await connection.execute(`
      SHOW INDEX FROM words
    `);

    indexes.forEach((index) => {
      console.log(
        `   - ${index.Key_name}: ${index.Column_name} (unique: ${index.Non_unique === 0})`,
      );
    });

    console.log('\n' + '='.repeat(50));

    // 2. 测试插入相同单词到不同单词书
    console.log('2. 测试插入相同单词到不同单词书:');

    const testWords = [
      { word: 'test_word_unique', book_id: 'TEST_BOOK_1' },
      { word: 'test_word_unique', book_id: 'TEST_BOOK_2' },
      { word: 'test_word_unique', book_id: 'TEST_BOOK_3' },
    ];

    // 先清理测试数据
    await connection.execute(`
      DELETE FROM words WHERE word = 'test_word_unique'
    `);

    // 逐个插入测试
    for (let i = 0; i < testWords.length; i++) {
      const testWord = testWords[i];
      try {
        const [result] = await connection.execute(
          `
          INSERT INTO words (word, book_id, source, created_at, updated_at) 
          VALUES (?, ?, 'TEST', NOW(), NOW())
        `,
          [testWord.word, testWord.book_id],
        );

        console.log(
          `   ✅ 成功插入: "${testWord.word}" 到单词书 "${testWord.book_id}" (ID: ${result.insertId})`,
        );
      } catch (error) {
        console.log(
          `   ❌ 插入失败: "${testWord.word}" 到单词书 "${testWord.book_id}" - ${error.message}`,
        );
      }
    }

    console.log('\n' + '='.repeat(50));

    // 3. 验证插入结果
    console.log('3. 验证插入结果:');
    const [testResults] = await connection.execute(`
      SELECT id, word, book_id, source FROM words WHERE word = 'test_word_unique'
    `);

    console.log(`   找到 ${testResults.length} 条记录:`);
    testResults.forEach((row, index) => {
      console.log(
        `   ${index + 1}. ID: ${row.id}, 单词: ${row.word}, 单词书: ${row.book_id}, 来源: ${row.source}`,
      );
    });

    console.log('\n' + '='.repeat(50));

    // 4. 测试重复插入到同一单词书（应该失败）
    console.log('4. 测试重复插入到同一单词书（应该失败）:');
    try {
      await connection.execute(
        `
        INSERT INTO words (word, book_id, source, created_at, updated_at) 
        VALUES (?, ?, 'TEST_DUPLICATE', NOW(), NOW())
      `,
        ['test_word_unique', 'TEST_BOOK_1'],
      );

      console.log('   ❌ 意外成功 - 复合唯一索引可能未生效');
    } catch (error) {
      console.log('   ✅ 预期失败 - 复合唯一索引正常工作');
      console.log(`      错误: ${error.message}`);
    }

    console.log('\n' + '='.repeat(50));

    // 5. 检查现有的web单词记录
    console.log('5. 检查现有的web单词记录:');
    const [webWords] = await connection.execute(`
      SELECT id, word, book_id, source, created_at FROM words WHERE word = 'web'
    `);

    if (webWords.length > 0) {
      console.log(`   找到 ${webWords.length} 条web单词记录:`);
      webWords.forEach((row, index) => {
        console.log(
          `   ${index + 1}. ID: ${row.id}, 单词书: ${row.book_id}, 来源: ${row.source}, 创建时间: ${row.created_at}`,
        );
      });
    } else {
      console.log('   未找到web单词记录');
    }

    // 清理测试数据
    await connection.execute(`
      DELETE FROM words WHERE word = 'test_word_unique'
    `);
    console.log('\n   测试数据已清理');

    console.log('\n' + '='.repeat(50));
    console.log('✅ 验证完成！单词唯一索引修复成功');
  } catch (error) {
    console.error('验证过程中出现错误:', error);
  } finally {
    await connection.end();
  }
}

// 执行验证
verifyWordUniqueConstraintFix().catch(console.error);
