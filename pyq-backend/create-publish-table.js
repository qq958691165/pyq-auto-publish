const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createPublishTasksTable() {
  console.log('🚀 开始创建publish_tasks表...');
  
  const sql = `
    CREATE TABLE IF NOT EXISTS publish_tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      rewrite_id UUID,
      task_title VARCHAR(255),
      content TEXT NOT NULL,
      images TEXT[],
      wechat_account VARCHAR(100),
      publish_time TIMESTAMP NOT NULL,
      is_immediate BOOLEAN DEFAULT false,
      random_delay_minutes INTEGER DEFAULT 0,
      status VARCHAR(50) DEFAULT 'pending',
      duixueqiu_task_id VARCHAR(100),
      error_message TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_publish_tasks_status ON publish_tasks(status);
    CREATE INDEX IF NOT EXISTS idx_publish_tasks_publish_time ON publish_tasks(publish_time);
    CREATE INDEX IF NOT EXISTS idx_publish_tasks_user_id ON publish_tasks(user_id);
  `;

  try {
    // 尝试查询表,如果不存在会报错
    const { data, error } = await supabase
      .from('publish_tasks')
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') {
      console.log('⚠️  表不存在,需要手动创建');
      console.log('\n请在Supabase Dashboard的SQL Editor中执行以下SQL:\n');
      console.log(sql);
      console.log('\n或者使用psql命令行工具连接数据库执行');
    } else if (error) {
      console.error('❌ 检查表失败:', error);
    } else {
      console.log('✅ publish_tasks表已存在!');
    }
  } catch (err) {
    console.error('❌ 执行失败:', err);
  }
}

createPublishTasksTable();

