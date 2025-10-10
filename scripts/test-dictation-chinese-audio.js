/**
 * 测试听写记录创建的中文语音生成功能
 * 测试命令：node scripts/test-dictation-chinese-audio.js
 */

async function testDictationWithChineseAudio() {
  const baseUrl = 'http://localhost:8088/en-study';

  // 测试数据：包含中文释义的单词
  const testData = {
    name: '中文语音测试听写',
    description: '测试单词中文释义语音生成功能',
    question_type: 'chinese',
    word_time_limit: 30,
    switch_mode: 'auto',
    input_method: 'keyboard',
    words: [
      {
        word: 'hello',
        us_phonetic: '/həˈloʊ/',
        uk_phonetic: '/həˈləʊ/',
        translations: [
          {
            translation: '你好',
            part_of_speech: 'interjection',
            is_primary: true,
            source: 'database',
          },
          {
            translation: '打招呼',
            part_of_speech: 'verb',
            is_primary: false,
            source: 'database',
          },
        ],
        sentences: [
          {
            sentence: 'Hello, how are you?',
            translation: '你好，你好吗？',
          },
        ],
        synonyms: [
          {
            word: 'hi',
            translation: '嗨',
          },
        ],
        phrases: [
          {
            phrase: 'say hello',
            translation: '打招呼',
          },
        ],
        related_words: [
          {
            word: 'greet',
            translation: '问候',
            relation_type: 'synonym',
          },
        ],
      },
      {
        word: 'world',
        us_phonetic: '/wɜːrld/',
        uk_phonetic: '/wɜːld/',
        translations: [
          {
            translation: '世界',
            part_of_speech: 'noun',
            is_primary: true,
            source: 'database',
          },
          {
            translation: '全球',
            part_of_speech: 'noun',
            is_primary: false,
            source: 'database',
          },
        ],
        sentences: [
          {
            sentence: 'The world is beautiful.',
            translation: '世界是美丽的。',
          },
        ],
        synonyms: [
          {
            word: 'earth',
            translation: '地球',
          },
        ],
        phrases: [
          {
            phrase: 'around the world',
            translation: '环游世界',
          },
        ],
        related_words: [
          {
            word: 'global',
            translation: '全球的',
            relation_type: 'related',
          },
        ],
      },
    ],
  };

  try {
    console.log('🚀 开始测试听写记录创建功能...');
    console.log('📝 测试数据:', JSON.stringify(testData, null, 2));

    // 创建听写记录
    const response = await fetch(`${baseUrl}/dictation/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `请求失败: ${response.status} ${response.statusText}\n${errorText}`,
      );
    }

    const result = await response.json();
    console.log('✅ 听写记录创建成功!');
    console.log('📋 返回结果:', JSON.stringify(result, null, 2));

    if (result.code === 200 && result.data && result.data.id) {
      const dictationId = result.data.id;
      console.log(`🎯 听写记录ID: ${dictationId}`);

      // 等待一段时间，让语音生成完成
      console.log('⏳ 等待2秒钟，让语音生成完成...');
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 查询听写单词详情，检查中文语音是否生成
      console.log('🔍 查询听写单词详情...');
      const wordsResponse = await fetch(
        `${baseUrl}/dictation/records/${dictationId}`,
      );

      if (wordsResponse.ok) {
        const wordsResult = await wordsResponse.json();
        console.log('📚 听写单词详情:', JSON.stringify(wordsResult, null, 2));

        if (
          wordsResult.code === 200 &&
          wordsResult.data &&
          wordsResult.data.words
        ) {
          wordsResult.data.words.forEach((word, index) => {
            console.log(`\n📖 单词 ${index + 1}: ${word.word}`);
            console.log(
              `📱 中文释义: ${word.translations?.[0]?.translation || '无'}`,
            );
            console.log(
              `🔊 中文语音URL: ${word.chinese_audio_url || '未生成'}`,
            );

            if (word.chinese_audio_url) {
              console.log(`✅ 中文语音生成成功!`);
            } else {
              console.log(`⚠️ 中文语音未生成`);
            }
          });
        }
      } else {
        console.log('⚠️ 无法获取听写单词详情');
      }
    }
  } catch (error) {
    console.error('❌ 测试失败:', error.message);

    // 如果是网络错误，提供更多诊断信息
    if (error.message.includes('fetch')) {
      console.log('🔧 请确保：');
      console.log('1. NestJS服务器正在运行 (npm run start:dev)');
      console.log('2. 服务器地址正确 (http://localhost:8088)');
      console.log('3. 网络连接正常');
    }
  }
}

// 检查是否直接运行此脚本
if (require.main === module) {
  testDictationWithChineseAudio();
}

module.exports = { testDictationWithChineseAudio };
