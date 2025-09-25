#!/usr/bin/env node

/*
 * @Author: wanglx
 * @Date: 2025-09-25 17:30:00
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-25 17:30:00
 * @Description: 测试文件上传功能脚本
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */

const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

const BASE_URL = 'http://localhost:8088/en-study';

// 创建一个简单的测试图片文件
function createTestImage() {
  // 创建一个简单的SVG测试图片
  const svgContent = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="blue"/>
      <text x="50" y="50" text-anchor="middle" fill="white" font-size="12">Test</text>
    </svg>
  `;

  const testImagePath = '/tmp/test-upload.svg';
  fs.writeFileSync(testImagePath, svgContent);
  return testImagePath;
}

async function testImageUpload() {
  try {
    console.log('开始测试图片上传功能...\n');

    const testImagePath = createTestImage();
    console.log(`测试图片创建成功: ${testImagePath}\n`);

    // 测试场景1: 不传folder参数，应该存储到Upload文件夹
    console.log('='.repeat(60));
    console.log('测试场景1: 不传folder参数 (应该存储到Upload文件夹)');
    console.log('='.repeat(60));

    try {
      const formData1 = new FormData();
      formData1.append('image', fs.createReadStream(testImagePath));

      const response1 = await axios.post(
        `${BASE_URL}/upload/image`,
        formData1,
        {
          headers: {
            ...formData1.getHeaders(),
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('✅ 测试场景1成功!');
      console.log(`   返回状态: ${response1.status}`);
      console.log(`   响应数据:`, JSON.stringify(response1.data, null, 2));

      if (response1.data.data && response1.data.data.url) {
        console.log(`   文件URL: ${response1.data.data.url}`);
        if (response1.data.data.url.includes('Upload/')) {
          console.log('   ✅ 确认: 文件存储在Upload文件夹下');
        } else {
          console.log('   ⚠️  警告: 文件未存储在预期的Upload文件夹下');
        }
      }
    } catch (error) {
      console.log('❌ 测试场景1失败:');
      if (error.response) {
        console.log(`   状态码: ${error.response.status}`);
        console.log(
          `   错误信息:`,
          JSON.stringify(error.response.data, null, 2),
        );
      } else {
        console.log(`   网络错误: ${error.message}`);
      }
    }

    console.log('\n');

    // 测试场景2: 传folder参数，应该存储到Files/指定文件夹
    console.log('='.repeat(60));
    console.log(
      '测试场景2: 传folder参数="documents" (应该存储到Files/documents文件夹)',
    );
    console.log('='.repeat(60));

    try {
      const formData2 = new FormData();
      formData2.append('image', fs.createReadStream(testImagePath));
      formData2.append('folder', 'documents');

      const response2 = await axios.post(
        `${BASE_URL}/upload/image`,
        formData2,
        {
          headers: {
            ...formData2.getHeaders(),
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('✅ 测试场景2成功!');
      console.log(`   返回状态: ${response2.status}`);
      console.log(`   响应数据:`, JSON.stringify(response2.data, null, 2));

      if (response2.data.data && response2.data.data.url) {
        console.log(`   文件URL: ${response2.data.data.url}`);
        if (response2.data.data.url.includes('Files/documents/')) {
          console.log('   ✅ 确认: 文件存储在Files/documents文件夹下');
        } else {
          console.log('   ⚠️  警告: 文件未存储在预期的Files/documents文件夹下');
        }
      }
    } catch (error) {
      console.log('❌ 测试场景2失败:');
      if (error.response) {
        console.log(`   状态码: ${error.response.status}`);
        console.log(
          `   错误信息:`,
          JSON.stringify(error.response.data, null, 2),
        );
      } else {
        console.log(`   网络错误: ${error.message}`);
      }
    }

    console.log('\n');

    // 测试场景3: 传folder参数为其他值
    console.log('='.repeat(60));
    console.log(
      '测试场景3: 传folder参数="reports/2024" (应该存储到Files/reports/2024文件夹)',
    );
    console.log('='.repeat(60));

    try {
      const formData3 = new FormData();
      formData3.append('image', fs.createReadStream(testImagePath));
      formData3.append('folder', 'reports/2024');

      const response3 = await axios.post(
        `${BASE_URL}/upload/image`,
        formData3,
        {
          headers: {
            ...formData3.getHeaders(),
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('✅ 测试场景3成功!');
      console.log(`   返回状态: ${response3.status}`);
      console.log(`   响应数据:`, JSON.stringify(response3.data, null, 2));

      if (response3.data.data && response3.data.data.url) {
        console.log(`   文件URL: ${response3.data.data.url}`);
        if (response3.data.data.url.includes('Files/reports/2024/')) {
          console.log('   ✅ 确认: 文件存储在Files/reports/2024文件夹下');
        } else {
          console.log(
            '   ⚠️  警告: 文件未存储在预期的Files/reports/2024文件夹下',
          );
        }
      }
    } catch (error) {
      console.log('❌ 测试场景3失败:');
      if (error.response) {
        console.log(`   状态码: ${error.response.status}`);
        console.log(
          `   错误信息:`,
          JSON.stringify(error.response.data, null, 2),
        );
      } else {
        console.log(`   网络错误: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📋 测试总结:');
    console.log('   1. 不传folder参数 → 存储到 Upload/ 文件夹');
    console.log('   2. 传folder参数 → 存储到 Files/{folder}/ 文件夹');
    console.log('   3. 支持多级文件夹路径 (如: reports/2024)');
    console.log('='.repeat(60));

    // 清理测试文件
    fs.unlinkSync(testImagePath);
    console.log('\n测试文件已清理');
    console.log('\n✅ 文件上传功能测试完成!');
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  }
}

// 执行测试
testImageUpload().catch(console.error);
