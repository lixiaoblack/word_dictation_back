#!/bin/bash

echo "=== Swagger 集成测试 ==="

API_BASE="http://localhost:3000"

# 检查服务是否运行
echo "1. 检查服务状态："
if curl -s "$API_BASE/api/health" > /dev/null; then
    echo "✅ 服务正常运行"
else
    echo "❌ 服务未运行，请先启动服务"
    exit 1
fi

# 检查Swagger UI页面
echo "2. 检查Swagger UI页面："
if curl -s "$API_BASE/api/docs" | grep -q "英文学习助手 API 文档"; then
    echo "✅ Swagger UI 页面正常"
else
    echo "❌ Swagger UI 页面异常"
fi

# 检查Swagger JSON Schema
echo "3. 检查Swagger JSON Schema："
if curl -s "$API_BASE/api/docs-json" | jq -e '.openapi' > /dev/null 2>&1; then
    echo "✅ Swagger JSON Schema 正常"
    echo "   OpenAPI版本: $(curl -s "$API_BASE/api/docs-json" | jq -r '.openapi')"
    echo "   API标题: $(curl -s "$API_BASE/api/docs-json" | jq -r '.info.title')"
else
    echo "❌ Swagger JSON Schema 异常"
fi

# 检查API端点数量
echo "4. 检查API端点："
ENDPOINT_COUNT=$(curl -s "$API_BASE/api/docs-json" | jq '.paths | keys | length')
echo "   发现 $ENDPOINT_COUNT 个API端点"

# 列出所有端点
echo "5. API端点列表："
curl -s "$API_BASE/api/docs-json" | jq -r '.paths | keys[]' | while read endpoint; do
    echo "   - $endpoint"
done

# 检查标签
echo "6. API标签："
curl -s "$API_BASE/api/docs-json" | jq -r '.tags[].name' | while read tag; do
    echo "   - $tag"
done

echo ""
echo "🎉 Swagger集成测试完成！"
echo "📚 访问文档: $API_BASE/api/docs"
echo "📄 JSON Schema: $API_BASE/api/docs-json"