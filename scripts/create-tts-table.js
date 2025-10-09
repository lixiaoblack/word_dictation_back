const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function createTtsTable() {
  let connection;

  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: '119.45.129.229',
      port: 3306,
      user: 'en_study',
      password: 'root123!',
      database: 'en_study',
    });

    console.log('✅ 数据库连接成功');

    // 读取SQL文件
    const sqlPath = path.join(
      __dirname,
      '../sql/create_tts_audio_records_table.sql',
    );
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 执行SQL脚本...');
    console.log(sql);

    // 执行SQL
    await connection.execute(sql);

    console.log('✅ tts_audio_records 表创建成功!');

    // 验证表是否创建成功
    const [rows] = await connection.execute(
      'SHOW TABLES LIKE "tts_audio_records"',
    );

    if (rows.length > 0) {
      console.log('✅ 表验证成功，tts_audio_records 表已存在');

      // 显示表结构
      const [columns] = await connection.execute('DESCRIBE tts_audio_records');
      console.log('\n📋 表结构:');
      console.table(columns);
    } else {
      console.log('❌ 表验证失败，tts_audio_records 表不存在');
    }
  } catch (error) {
    console.error('❌ 创建表时出错:', error.message);
    console.error('完整错误:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 执行创建表操作
createTtsTable().catch(console.error);
