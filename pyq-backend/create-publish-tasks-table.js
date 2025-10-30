const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createPublishTasksTable() {
  try {
    console.log('开始创建publish_tasks表...');

    // 读取SQL文件内容
    const fs = require('fs');
    const path = require('path');
    const sqlPath = path.join(__dirname, 'src/migrations/create-publish-tasks.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // 执行SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sql,
    });

    if (error) {
      console.error('创建表失败:', error);
      return;
    }

    console.log('✅ publish_tasks表创建成功!');
  } catch (error) {
    console.error('执行失败:', error);
  }
}

createPublishTasksTable();

