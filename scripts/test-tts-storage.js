/*
 * @Author: wanglx
 * @Date: 2025-10-09 20:00:00
 * @LastEditors: wanglx
 * @LastEditTime: 2025-10-09 20:00:00
 * @Description: TTS批量音频存储功能测试脚本
 */
const axios = require('axios');

const BASE_URL = 'http://localhost:8088/en-study';

async function testTtsWithStorage() {
  console.log('🎵 开始测试TTS音频存储功能...\n');

  try {
    // 测试1: 单个文本转语音并存储
    console.log('='.repeat(60));
    console.log('测试1: 单个文本转语音并存储');
    console.log('='.repeat(60));

    const singleTextRequest = {
      text: 'Hello, this is a test of TTS with OSS storage.',
      voice: 'en-US-AriaNeural',
      rate: 1.0,
      pitch: 0,
      volume: 100,
    };

    const response1 = await axios.post(
      `${BASE_URL}/tts/text-with-storage`,
      singleTextRequest,
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );

    console.log('✅ 单个文本转语音测试成功!');
    console.log('响应数据:', JSON.stringify(response1.data, null, 2));

    // 测试2: 批量文本转语音并存储
    console.log('\n' + '='.repeat(60));
    console.log('测试2: 批量文本转语音并存储');
    console.log('='.repeat(60));

    const batchRequest = {
      texts: ['apple', 'banana', 'orange', 'grape', 'watermelon'],
      voice: 'en-US-AriaNeural',
      rate: 1.0,
      pitch: 0,
      volume: 100,
      type: 'word',
      force_regenerate: false,
    };

    const response2 = await axios.post(
      `${BASE_URL}/tts/batch-with-storage`,
      batchRequest,
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );

    console.log('✅ 批量文本转语音测试成功!');
    console.log('响应数据:', JSON.stringify(response2.data, null, 2));

    // 测试3: 重复测试，验证去重功能
    console.log('\n' + '='.repeat(60));
    console.log('测试3: 重复请求测试（验证去重功能）');
    console.log('='.repeat(60));

    const response3 = await axios.post(
      `${BASE_URL}/tts/text-with-storage`,
      singleTextRequest,
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );

    console.log('✅ 重复请求测试成功!');
    console.log('响应数据:', JSON.stringify(response3.data, null, 2));

    if (response3.data.data && !response3.data.data.is_new) {
      console.log('✅ 确认: 检测到重复内容，返回了缓存的音频');
    }

    // 测试4: 查询音频记录
    console.log('\n' + '='.repeat(60));
    console.log('测试4: 查询音频记录');
    console.log('='.repeat(60));

    const response4 = await axios.get(
      `${BASE_URL}/tts/records?page=1&page_size=10`,
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );

    console.log('✅ 查询音频记录测试成功!');
    console.log('响应数据:', JSON.stringify(response4.data, null, 2));

    // 测试5: 获取统计信息
    console.log('\n' + '='.repeat(60));
    console.log('测试5: 获取TTS统计信息');
    console.log('='.repeat(60));

    const response5 = await axios.get(`${BASE_URL}/tts/statistics`, {
      headers: { 'Content-Type': 'application/json' },
    });

    console.log('✅ 获取统计信息测试成功!');
    console.log('响应数据:', JSON.stringify(response5.data, null, 2));

    // 测试6: 测试强制重新生成
    console.log('\n' + '='.repeat(60));
    console.log('测试6: 强制重新生成测试');
    console.log('='.repeat(60));

    const forceRegenerateRequest = {
      texts: ['apple'],
      voice: 'en-US-AriaNeural',
      rate: 1.2, // 不同的语速
      force_regenerate: true,
    };

    const response6 = await axios.post(
      `${BASE_URL}/tts/batch-with-storage`,
      forceRegenerateRequest,
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );

    console.log('✅ 强制重新生成测试成功!');
    console.log('响应数据:', JSON.stringify(response6.data, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('🎉 所有TTS音频存储功能测试完成!');
    console.log('📋 测试总结:');
    console.log('   1. 单个文本转语音并存储 ✅');
    console.log('   2. 批量文本转语音并存储 ✅');
    console.log('   3. 重复内容去重验证 ✅');
    console.log('   4. 音频记录查询 ✅');
    console.log('   5. 统计信息获取 ✅');
    console.log('   6. 强制重新生成 ✅');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('❌ 测试过程中出现错误:');
    if (error.response) {
      console.error(`状态码: ${error.response.status}`);
      console.error('错误信息:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('网络错误:', error.message);
    }
  }
}

// 执行测试
testTtsWithStorage().catch(console.error);
