-- ==================== 一键优化好友查询性能 ====================
-- 问题: 加载好友列表失败 - canceling statement due to statement timeout
-- 解决: 创建索引 + 增加超时时间 + 清理死元组
-- 执行方式: 在Supabase SQL Editor中全选并执行

-- ==================== 步骤1: 创建覆盖索引(最重要!) ====================

-- 删除旧索引(如果存在)
DROP INDEX IF EXISTS idx_duixueqiu_friends_user_name;

-- 创建新的覆盖索引(包含所有查询字段,避免回表)
CREATE INDEX IF NOT EXISTS idx_duixueqiu_friends_covering 
ON duixueqiu_friends(user_id, friend_name) 
INCLUDE (id, friend_remark, avatar_url, wechat_account_name, is_selected);

-- 为is_selected创建部分索引(优化选中好友查询)
CREATE INDEX IF NOT EXISTS idx_duixueqiu_friends_selected 
ON duixueqiu_friends(user_id, is_selected) 
WHERE is_selected = true;

-- ==================== 步骤2: 增加查询超时时间 ====================

-- 查看当前超时设置
SHOW statement_timeout;

-- 增加超时时间到120秒(推荐)
ALTER DATABASE postgres SET statement_timeout = '120s';

-- 如果上面的命令权限不足,可以尝试为当前会话设置
SET statement_timeout = '120s';

-- ==================== 步骤3: 清理死元组和更新统计信息 ====================

-- 清理死元组(dead tuples)
VACUUM ANALYZE duixueqiu_friends;

-- 更新表统计信息
ANALYZE duixueqiu_friends;

-- ==================== 步骤4: 验证优化效果 ====================

-- 查看索引是否创建成功
SELECT 
  indexname as "索引名称",
  indexdef as "索引定义",
  pg_size_pretty(pg_relation_size(indexrelid)) as "索引大小"
FROM pg_indexes 
WHERE tablename = 'duixueqiu_friends'
ORDER BY indexname;

-- 查看表的统计信息
SELECT 
  schemaname as "模式",
  tablename as "表名",
  n_live_tup as "活跃行数",
  n_dead_tup as "死元组数",
  round(n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0), 2) as "死元组比例%",
  last_vacuum as "上次VACUUM",
  last_analyze as "上次ANALYZE"
FROM pg_stat_user_tables 
WHERE tablename = 'duixueqiu_friends';

-- 测试查询性能(替换YOUR_USER_ID为实际用户ID)
-- 应该看到 "Index Scan" 而不是 "Seq Scan"
EXPLAIN ANALYZE
SELECT id, friend_name, friend_remark, avatar_url, wechat_account_name, is_selected
FROM duixueqiu_friends
WHERE user_id = 'YOUR_USER_ID'
ORDER BY friend_name
LIMIT 5000;

-- ==================== 预期结果 ====================

-- 1. 索引创建成功: 应该看到 idx_duixueqiu_friends_covering 索引
-- 2. 超时时间增加: statement_timeout = 120s
-- 3. 死元组清理: 死元组比例 < 10%
-- 4. 查询计划优化: 使用 Index Scan using idx_duixueqiu_friends_covering
-- 5. 执行时间: Execution Time < 5000ms (5秒)

-- ==================== 如果还是超时 ====================

-- 方案A: 进一步增加超时时间
-- ALTER DATABASE postgres SET statement_timeout = '300s';

-- 方案B: 检查是否有长时间运行的查询阻塞
-- SELECT pid, usename, state, query, now() - query_start as duration
-- FROM pg_stat_activity
-- WHERE state != 'idle'
-- ORDER BY duration DESC;

-- 方案C: 强制重建索引
-- REINDEX INDEX idx_duixueqiu_friends_covering;

-- ==================== 完成 ====================
-- 执行完成后,刷新前端页面测试好友列表加载速度
-- 预期: 5747个好友应该在5-10秒内加载完成

