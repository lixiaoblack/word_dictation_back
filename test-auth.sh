#!/bin/bash

# 测试认证功能的脚本

echo "测试登录功能"

# 测试手机号登录（用户不存在，应该自动注册）
echo "1. 测试手机号登录（自动注册）"
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "13800138000",
    "password": "password123"
  }'

echo -e "\n\n"

# 测试邮箱登录（用户不存在，应该自动注册）
echo "2. 测试邮箱登录（自动注册）"
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "password123"
  }'

echo -e "\n\n"

# 测试已存在的用户登录
echo "3. 测试已存在用户登录"
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "13800138000",
    "password": "password123"
  }'

echo -e "\n\n"

echo "测试完成"