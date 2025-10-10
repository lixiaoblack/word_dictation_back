/**
 * 数据库迁移脚本：为dictation_words表添加chinese_audio_url字段
 * 执行命令：node database/migrate-add-chinese-audio-url.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  let connection;

  try {
    // 数据库连接配置
    const config = {
      host: process.env.DB_HOST || '119.45.129.229',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USERNAME || 'en_study',
      password: process.env.DB_PASSWORD || 'root123!',
      database: process.env.DB_DATABASE || 'en_study',
    };

    console.log('正在连接数据库...');
    connection = await mysql.createConnection(config);
    console.log('数据库连接成功');

    // 读取SQL文件
    const sqlFilePath = path.join(
      __dirname,
      'add_chinese_audio_url_to_dictation_words.sql',
    );
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // 分割SQL语句（去除注释行）
    const sqlStatements = sqlContent
      .split(';')
      .map((stmt) => stmt.trim())
      .filter(
        (stmt) => stmt && !stmt.startsWith('--') && !stmt.startsWith('/*'),
      );

    console.log('开始执行数据库迁移...');

    for (const sql of sqlStatements) {
      if (sql.trim()) {
        console.log(`执行SQL: ${sql.substring(0, 100)}...`);
        try {
          const [result] = await connection.execute(sql);
          console.log('✓ 执行成功');

          // 如果是查询语句，显示结果
          if (sql.trim().toUpperCase().startsWith('SELECT')) {
            console.log('查询结果:', result);
          }
        } catch (error) {
          // 如果字段已存在，忽略错误
          if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('⚠ 字段已存在，跳过');
          } else {
            throw error;
          }
        }
      }
    }

    console.log('✅ 数据库迁移完成！');
  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 检查是否直接运行此脚本
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
