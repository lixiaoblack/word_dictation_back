/*
 * @Author: wanglx
 * @Date: 2025-09-24 16:07:53
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-24 16:21:54
 * @Description: 文本处理工具函数
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */

/**
 * 替换法语字符为英语字符
 * 处理字典中混入的法语字母
 * @param str 待处理的字符串
 * @returns 处理后的字符串
 */
export function replaceFrenchChars(str: string): string {
  if (!str) return str;

  const frenchToEnglish: [string, string][] = [
    ['é', 'e'],
    ['ê', 'e'],
    ['è', 'e'],
    ['ë', 'e'],
    ['à', 'a'],
    ['â', 'a'],
    ['ç', 'c'],
    ['î', 'i'],
    ['ï', 'i'],
    ['ô', 'o'],
    ['ù', 'u'],
    ['û', 'u'],
    ['ü', 'u'],
    ['ÿ', 'y'],
  ];

  let result = str;
  for (const [french, english] of frenchToEnglish) {
    result = result.replace(new RegExp(french, 'g'), english);
  }

  return result;
}

/**
 * 清理文本内容，移除多余空格和特殊字符
 * @param text 待处理的文本
 * @returns 清理后的文本
 */
export function cleanText(text: string): string {
  if (!text) return text;

  return text
    .trim()
    .replace(/\s+/g, ' ') // 多个空格替换为单个空格
    .replace(/[\r\n]+/g, ' '); // 换行符替换为空格
}

/**
 * 验证并修复JSON格式的文本
 * @param text 待验证的JSON文本
 * @returns 修复后的文本
 */
export function validateAndFixJson(text: string): string {
  if (!text) return text;

  try {
    // 尝试解析JSON，如果成功则返回原文本
    JSON.parse(text);
    return text;
  } catch (error) {
    // JSON解析失败，尝试修复常见问题
    let fixed = text
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // 移除控制字符
      .replace(/'/g, '"') // 单引号替换为双引号
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // 给属性名加双引号
      .replace(/:\s*'([^']*)'/g, ': "$1"') // 给字符串值加双引号
      .replace(/,(\s*[}\]])/g, '$1'); // 移除多余的逗号

    return fixed;
  }
}
