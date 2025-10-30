const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://upcsdbcpmzpywvykiqtu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwY3NkYmNwbXpweXd2eWtpcXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjI0NzgsImV4cCI6MjA3NjY5ODQ3OH0.-NVmwlrjdVvgoyhXMpi_HsBhYrDvfEKIYQAimuhMKDI';

async function createPublishTasksTable() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    console.log('🔄 正在创建 publish_tasks 表...');

    // 执行SQL创建表
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (error) {
      console.error('❌ 创建表失败:', error);

      // 尝试直接插入一条测试数据来触发表创建
      console.log('🔄 尝试通过插入数据方式验证表是否存在...');
      const { data: testData, error: testError } = await supabase
        .from('publish_tasks')
        .select('*')
        .limit(1);

      if (testError) {
        console.error('❌ 表不存在,需要手动在Supabase Dashboard创建');
        console.log('\n请在Supabase Dashboard的SQL Editor中执行以下SQL:\n');
        console.log(`
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
        `);
      } else {
        console.log('✅ 表已存在!');
      }
    } else {
      console.log('✅ 表创建成功!');
      console.log('响应:', data);
    }
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    process.exit(1);
  }
}

createPublishTasksTable();

