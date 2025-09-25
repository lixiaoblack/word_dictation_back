/*
 * @Author: wanglx
 * @Date: 2025-09-24 16:07:53
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-24 16:21:54
 * @Description: 测试单词数据
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */

// 测试数据 - 基于您提供的数据格式
export const testWordsData = [
  {
    word: 'pharmacy',
    translations: [
      {
        translation: '药房；配药学，药剂学；制药业；一批备用药品',
        type: 'n',
      },
    ],
    phrases: [
      {
        phrase: 'college of pharmacy',
        translation: '药学院；药剂学院',
      },
      {
        phrase: 'pharmacy equipment',
        translation: '药房设备',
      },
    ],
  },
  {
    word: 'foregone',
    translations: [
      {
        translation: '过去的；先前的；预知的；预先决定的',
        type: 'adj',
      },
      {
        translation: '发生在…之前（forego的过去分词）',
        type: 'v',
      },
    ],
    phrases: [
      {
        phrase: 'foregone conclusion',
        translation: '预料之中必然发生的事情；不可避免的结局',
      },
    ],
  },
  {
    word: 'president',
    translations: [
      {
        translation: '总统；董事长；校长；主席',
        type: 'n',
      },
    ],
    phrases: [
      {
        phrase: 'vice president',
        translation: '副总统；副主席',
      },
      {
        phrase: 'former president',
        translation: '前任总统',
      },
      {
        phrase: 'senior vice president',
        translation: '高级副总裁',
      },
      {
        phrase: 'executive vice president',
        translation: '执行副总裁',
      },
      {
        phrase: 'honorary president',
        translation: '名誉会长，名誉主席',
      },
      {
        phrase: 'acting president',
        translation: '代总统；代理校长；代理总裁',
      },
      {
        phrase: 'president elect',
        translation: '当选总统（尚未就职的）',
      },
      {
        phrase: 'deputy president',
        translation: '副行长；副校长',
      },
      {
        phrase: 'assistant president',
        translation: '总裁助理',
      },
      {
        phrase: 'president office',
        translation: '校长办公室',
      },
    ],
  },
];

/**
 * 导入请求数据格式示例
 */
export const importRequestExample = {
  words: testWordsData,
  source: 'BEC_2',
};

/**
 * 可以使用 POST /words/import 接口测试数据导入
 * 请求体格式：
 * ```json
 * {
 *   "words": [...],
 *   "source": "BEC_2"
 * }
 * ```
 */
