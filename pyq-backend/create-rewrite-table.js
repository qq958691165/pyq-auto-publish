const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createRewriteHistoryTable() {
  console.log('开始创建rewrite_history表...');

  const sql = `
    CREATE TABLE IF NOT EXISTS rewrite_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID,
      article_id UUID,
      original_content TEXT NOT NULL,
      original_images TEXT[],
      rewritten_content TEXT NOT NULL,
      selected_images TEXT[],
      coze_workflow_id VARCHAR(100),
      status VARCHAR(50) DEFAULT 'completed',
      error_message TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_rewrite_history_user_id ON rewrite_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_rewrite_history_article_id ON rewrite_history(article_id);
    CREATE INDEX IF NOT EXISTS idx_rewrite_history_created_at ON rewrite_history(created_at DESC);
  `;

  try {
    // 使用rpc调用执行SQL
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });

    if (error) {
      console.error('创建表失败:', error);
      return false;
    }

    console.log('✅ rewrite_history表创建成功!');
    return true;
  } catch (err) {
    console.error('执行失败:', err);
    return false;
  }
}

createRewriteHistoryTable().then(() => {
  console.log('完成');
  process.exit(0);
}).catch(err => {
  console.error('错误:', err);
  process.exit(1);
});
