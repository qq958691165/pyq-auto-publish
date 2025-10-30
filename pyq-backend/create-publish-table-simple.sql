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
