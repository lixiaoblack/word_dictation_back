#!/usr/bin/env node

// 使用Node.js内置的fetch（Node 18+）

const BASE_URL = 'http://localhost:8088/en-study/tts';

/**
 * 测试获取音频URL接口
 */
async function testGetAudioUrl() {
  console.log('=== 测试获取音频URL接口 ===\n');

  const testCases = [
    {
      name: '英文单词',
      data: {
        text: 'hello',
        rate: 1.0,
      },
    },
    {
      name: '中文汉字',
      data: {
        text: '你好',
        rate: 1.0,
      },
    },
    {
      name: '英文句子',
      data: {
        text: 'How are you today?',
        voice: 'en-US-AriaNeural',
        rate: 1.2,
      },
    },
    {
      name: '中文句子',
      data: {
        text: '今天天气真不错',
        voice: 'zh-CN-XiaoxiaoNeural',
        rate: 1.0,
      },
    },
    {
      name: '强制重新生成',
      data: {
        text: 'hello',
        force_regenerate: true,
      },
    },
  ];

  for (const testCase of testCases) {
    console.log(`🧪 测试: ${testCase.name}`);
    console.log(`📝 请求数据:`, JSON.stringify(testCase.data, null, 2));

    try {
      const response = await fetch(`${BASE_URL}/get-audio-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data),
      });

      const result = await response.json();

      if (response.ok) {
        console.log(`✅ 响应成功:`, JSON.stringify(result, null, 2));

        // 验证返回数据结构
        if (result.data) {
          const { file_url, is_new, voice_used, file_size, duration } =
            result.data;
          console.log(`📁 文件URL: ${file_url}`);
          console.log(`🆕 是否新文件: ${is_new}`);
          console.log(`🗣️ 使用语音: ${voice_used}`);
          console.log(`📊 文件大小: ${file_size} 字节`);
          console.log(`⏱️ 音频时长: ${duration} 秒`);
        }
      } else {
        console.log(`❌ 响应失败:`, JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.log(`💥 请求错误:`, error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // 添加延迟避免频率限制
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

/**
 * 测试智能语音检测
 */
async function testVoiceDetection() {
  console.log('=== 测试智能语音检测 ===\n');

  const testTexts = [
    'apple', // 纯英文
    '苹果', // 纯中文
    'hello world', // 英文短语
    '你好世界', // 中文短语
    'iPhone 15', // 英文+数字
    '价格是99元', // 中文+数字
  ];

  for (const text of testTexts) {
    console.log(`🧪 测试文本: "${text}"`);

    try {
      const response = await fetch(`${BASE_URL}/get-audio-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voice: 'auto' }),
      });

      const result = await response.json();

      if (response.ok && result.data) {
        console.log(`🗣️ 自动选择语音: ${result.data.voice_used}`);
        console.log(`📁 文件URL: ${result.data.file_url}`);
      } else {
        console.log(`❌ 失败:`, result.errmsg);
      }
    } catch (error) {
      console.log(`💥 错误:`, error.message);
    }

    console.log('');
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🚀 开始测试新增的获取音频URL接口\n');

    await testGetAudioUrl();
    await testVoiceDetection();

    console.log('✨ 测试完成！');
  } catch (error) {
    console.error('测试执行失败:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
