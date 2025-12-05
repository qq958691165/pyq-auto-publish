-- 解决duixueqiu_friends表查询超时问题
-- 问题: canceling statement due to statement timeout
-- 原因: Supabase默认的statement_timeout可能较短,大量数据查询时容易超时

-- ==================== 方案1: 增加statement_timeout(推荐) ====================

-- 1.1 查看当前的statement_timeout设置
SHOW statement_timeout;

-- 1.2 临时增加当前会话的超时时间(仅对当前连接有效)
SET statement_timeout = '60s';  -- 设置为60秒

-- 1.3 永久修改数据库级别的超时时间(需要超级用户权限)
-- ALTER DATABASE postgres SET statement_timeout = '60s';

-- ==================== 方案2: 优化索引(已执行,但可以再次确认) ====================

-- 2.1 确保组合索引存在
CREATE INDEX IF NOT EXISTS idx_duixueqiu_friends_user_name 
ON duixueqiu_friends(user_id, friend_name);

-- 2.2 为is_selected字段创建索引(优化选中好友查询)
CREATE INDEX IF NOT EXISTS idx_duixueqiu_friends_user_selected 
ON duixueqiu_friends(user_id, is_selected) 
WHERE is_selected = true;

-- 2.3 创建覆盖索引(包含所有查询字段,避免回表)
CREATE INDEX IF NOT EXISTS idx_duixueqiu_friends_covering 
ON duixueqiu_friends(user_id, friend_name) 
INCLUDE (id, friend_remark, avatar_url, wechat_account_index, wechat_account_name, is_selected);

-- ==================== 方案3: 优化查询字段(减少数据传输) ====================

-- 当前查询字段:
-- SELECT id, user_id, friend_name, friend_remark, avatar_url, wechat_account_index, wechat_account_name, is_selected

-- 优化建议: 只查询必要字段,减少数据传输量
-- SELECT id, friend_name, friend_remark, avatar_url, wechat_account_name, is_selected

-- ==================== 方案4: 清理无用数据 ====================

-- 4.1 查看表的大小
SELECT 
  pg_size_pretty(pg_total_relation_size('duixueqiu_friends')) as total_size,
  pg_size_pretty(pg_relation_size('duixueqiu_friends')) as table_size,
  pg_size_pretty(pg_indexes_size('duixueqiu_friends')) as indexes_size;

-- 4.2 查看死元组(dead tuples)数量
SELECT 
  schemaname,
  tablename,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows,
  round(n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0), 2) as dead_ratio
FROM pg_stat_user_tables 
WHERE tablename = 'duixueqiu_friends';

-- 4.3 如果死元组比例过高,执行VACUUM
VACUUM ANALYZE duixueqiu_friends;

-- ==================== 方案5: 分区表(适用于超大数据量) ====================

-- 如果好友数量超过100万,可以考虑按user_id分区
-- 这里仅提供思路,实际执行需要迁移数据

-- CREATE TABLE duixueqiu_friends_partitioned (
--   id BIGSERIAL,
--   user_id UUID NOT NULL,
--   friend_name TEXT,
--   ...
-- ) PARTITION BY HASH (user_id);

-- ==================== 验证优化效果 ====================

-- 查看查询计划(替换YOUR_USER_ID为实际用户ID)
EXPLAIN ANALYZE
SELECT id, user_id, friend_name, friend_remark, avatar_url, wechat_account_index, wechat_account_name, is_selected
FROM duixueqiu_friends
WHERE user_id = 'YOUR_USER_ID'
ORDER BY friend_name
LIMIT 2000;

-- 查看索引使用情况
SELECT 
  indexrelname as index_name,
  idx_scan as times_used,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes 
WHERE schemaname = 'public' 
  AND relname = 'duixueqiu_friends'
ORDER BY idx_scan DESC;

