#!/usr/bin/env node

/*
 * @Author: wanglx
 * @Date: 2025-09-24 16:50:00
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-24 16:50:00
 * @Description: 测试单词导入功能脚本
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8088/en-study';

async function testWordImport() {
  try {
    console.log('开始测试单词导入功能...\n');

    // 测试数据：同一个单词导入到不同的单词书
    const testWords = [
      {
        words: 'web',
        book_id: 'BEC_1',
      },
      {
        words: 'web',
        book_id: 'BEC_2',
      },
      {
        words: 'web',
        book_id: 'TOEFL_1',
      },
    ];

    // 逐个测试导入
    for (let i = 0; i < testWords.length; i++) {
      const testData = testWords[i];
      console.log(
        `测试 ${i + 1}: 导入单词 "${testData.words}" 到单词书 "${testData.book_id}"`,
      );

      try {
        const response = await axios.post(
          `${BASE_URL}/words/import`,
          testData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        console.log(`✅ 成功！响应: ${JSON.stringify(response.data)}`);
      } catch (error) {
        if (error.response) {
          console.log(
            `❌ 失败！状态码: ${error.response.status}, 错误: ${JSON.stringify(error.response.data)}`,
          );
        } else {
          console.log(`❌ 网络错误: ${error.message}`);
        }
      }

      console.log('---');
    }

    // 测试查询单词信息
    console.log('\n测试查询单词信息:');
    try {
      const response = await axios.get(`${BASE_URL}/words/web`);
      console.log(`✅ 查询成功！找到 ${response.data.data.length} 条记录:`);
      response.data.data.forEach((word, index) => {
        console.log(
          `  ${index + 1}. 单词书: ${word.book_id}, 来源: ${word.source}`,
        );
      });
    } catch (error) {
      console.log(`❌ 查询失败: ${error.message}`);
    }

    console.log('\n测试完成！');
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  }
}

// 执行测试
testWordImport().catch(console.error);
