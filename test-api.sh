#!/bin/bash

echo "=== 英文学习后台服务 API 测试 ==="

API_BASE="http://localhost:3000/api"

# 1. 健康检查
echo "1. 健康检查测试："
curl -s -X GET "$API_BASE/health" | jq '.'
echo ""

# 2. 简单文本处理测试
echo "2. 简单文本处理测试："
curl -s -X POST "$API_BASE/recognition/text?text=hello&provider=doubao" | jq '.'
echo ""

# 3. 复杂文本处理测试
echo "3. 复杂文本处理测试："
curl -s -X POST "$API_BASE/recognition/text?text=beautiful%20wonderful%20amazing&provider=doubao" | jq '.'
echo ""

# 4. DeepSeek提供商测试
echo "4. DeepSeek提供商测试："
curl -s -X POST "$API_BASE/recognition/text?text=computer&provider=deepseek" | jq '.'
echo ""

echo "=== 测试完成 ==="