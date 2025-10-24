# 朋友圈自动发布系统 - 完整技术文档 V3.0

## 📊 项目概述

### 🎯 项目目标
打造一个**全自动化的微信朋友圈发布系统**，实现从公众号文章采集、AI智能改写到多账号定时发布的全流程自动化。

**产品定位**:
- **当前阶段**: 小团队内部使用的MVP版本
- **未来目标**: 多租户SaaS产品,支持大规模用户

### 🔧 核心功能

#### **已实现功能** ✅
1. **微信公众号监控** - 基于we-mp-rss的公众号文章自动采集
   - 扫码登录微信公众平台
   - 订阅管理(添加/删除/手动更新)
   - 历史文章导入
   - 定时自动同步
   - 文章详情查看(含图片代理)

2. **用户认证系统** - JWT + bcrypt的安全认证
   - 用户注册/登录
   - Token管理
   - 权限控制

3. **文章管理** - 完整的文章CRUD
   - 文章列表(分页/筛选)
   - 文章详情
   - 按公众号筛选
   - 图片代理显示

4. **监控配置** - 灵活的同步设置
   - 自定义同步间隔
   - 定时任务管理

#### **待实现功能** 📋
1. **AI智能改写** - 基于Coze工作流的智能文案改写
2. **多账号管理** - 支持管理多个微信账号
3. **定时发布** - 通过堆雪球系统实现定时发布朋友圈
4. **数据统计** - 发布数据分析和效果追踪

### 💻 技术栈选型

#### **前端技术栈**
- **框架**: Vue 3 (CDN版本)
- **UI设计**: 自定义白色基调设计
- **HTTP客户端**: Fetch API
- **状态管理**: Vue 3 Composition API
- **图片处理**: 后端代理方案

#### **后端技术栈**
- **框架**: NestJS 10.0+
- **语言**: TypeScript 5.0+
- **数据库**: PostgreSQL 15+ (Supabase托管)
- **认证**: JWT + Passport
- **定时任务**: @nestjs/schedule + luxon
- **文件存储**: Supabase Storage

#### **公众号采集技术栈**
- **核心工具**: we-mp-rss (Docker部署)
- **爬取方式**: Selenium + Python
- **数据格式**: JSON API
- **认证方式**: JWT Bearer Token

#### **自动化技术栈** (待实现)
- **浏览器自动化**: Puppeteer 21.0+
- **AI工作流**: Coze API
- **数据存储**: 飞书多维表格 API

---

## 🏗️ 系统架构设计

### 📐 当前架构图 (MVP版本)

```
┌─────────────────────────────────────────────────────────────┐
│                        用户层                                │
│                  (Web浏览器 - 小团队使用)                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    前端层 (Vue 3)                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │ 登录页面 │ │ 首页     │ │ 公众号监控│                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    后端层 (NestJS)                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 用户模块 │ │ 文章模块 │ │ 监控模块 │ │ 配置模块 │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐                                 │
│  │ 定时任务 │ │ 图片代理 │                                 │
│  └──────────┘ └──────────┘                                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    数据层 (Supabase PostgreSQL)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │ users    │ │wechat_   │ │monitor_  │                    │
│  │          │ │articles  │ │config    │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  第三方服务层                                │
│  ┌──────────────────────────────────┐                       │
│  │   we-mp-rss (Docker容器)         │                       │
│  │   - 微信公众平台登录             │                       │
│  │   - 订阅管理                     │                       │
│  │   - 文章爬取                     │                       │
│  └──────────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

### 🚀 未来SaaS架构规划

```
┌─────────────────────────────────────────────────────────────┐
│                    多租户用户层                              │
│              (企业A / 企业B / 企业C ...)                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    租户隔离层                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │ 租户A    │ │ 租户B    │ │ 租户C    │                    │
│  │ we-mp-rss│ │ we-mp-rss│ │ we-mp-rss│                    │
│  │ 实例1    │ │ 实例2    │ │ 实例3    │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    统一后端服务层                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │ 租户管理 │ │ 实例编排 │ │ 资源调度 │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    多租户数据库                              │
│  (每个租户独立Schema或独立数据库)                           │
└─────────────────────────────────────────────────────────────┘
```

### 🔄 核心业务流程

#### **流程1: 公众号监控 (已实现)** ✅
```
管理员扫码登录微信公众平台
  ↓
we-mp-rss获取登录Cookie
  ↓
用户在前端搜索公众号
  ↓
调用we-mp-rss搜索API
  ↓
用户点击"添加订阅"
  ↓
we-mp-rss添加订阅
  ↓
自动触发历史文章导入
  ↓
we-mp-rss爬取文章列表
  ↓
调用文章详情API获取全文
  ↓
保存到PostgreSQL数据库
  ↓
前端显示文章列表
  ↓
定时任务自动同步新文章
```

#### **流程2: 文章查看 (已实现)** ✅
```
用户点击订阅的公众号
  ↓
加载该公众号的文章列表
  ↓
用户点击文章标题
  ↓
显示文章详情(标题+内容+图片)
  ↓
图片通过后端代理加载
  ↓
用户可以关闭文章返回列表
```

#### **流程3: AI智能改写 (待实现)** 📋
```
用户选择采集的文章
  ↓
点击"AI改写"按钮
  ↓
后端调用Coze改写工作流
  ↓
Coze生成多个改写版本
  ↓
返回改写结果
  ↓
保存到数据库
  ↓
前端展示改写版本供选择
```

#### **流程4: 自动发布朋友圈 (待实现)** 📋
```
用户选择改写文案
  ↓
选择微信账号和发布时间
  ↓
创建发布任务
  ↓
定时触发任务
  ↓
Puppeteer启动浏览器
  ↓
自动登录堆雪球系统
  ↓
上传图片素材
  ↓
填写文案内容
  ↓
选择微信账号
  ↓
设置发布时间
  ↓
提交发布任务
  ↓
更新任务状态
  ↓
通知用户发布结果
```

---

## 🗄️ 数据库设计

### 📋 当前数据表结构 (MVP版本)

#### **1. users (用户表)** ✅
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- bcrypt加密
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **2. wechat_articles (微信文章表)** ✅
```sql
CREATE TABLE wechat_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id VARCHAR(255) UNIQUE NOT NULL,  -- we-mp-rss文章ID
  account_id VARCHAR(255) NOT NULL,         -- 公众号ID
  account_name VARCHAR(255),                -- 公众号名称
  title TEXT NOT NULL,                      -- 文章标题
  content TEXT,                             -- 文章全文(HTML)
  url TEXT,                                 -- 文章链接
  author VARCHAR(255),                      -- 作者
  publish_time TIMESTAMP,                   -- 发布时间
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引优化
CREATE INDEX idx_account_id ON wechat_articles(account_id);
CREATE INDEX idx_publish_time ON wechat_articles(publish_time DESC);
```

#### **3. monitor_config (监控配置表)** ✅
```sql
CREATE TABLE monitor_config (
  id SERIAL PRIMARY KEY,
  config_key VARCHAR(255) UNIQUE NOT NULL,  -- 配置键
  config_value TEXT NOT NULL,               -- 配置值
  description TEXT,                         -- 配置说明
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 当前配置项
-- sync_interval_minutes: 自动同步间隔(分钟)
```

### 📋 未来SaaS版本数据表规划

#### **4. tenants (租户表)** 📋
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_name VARCHAR(100) NOT NULL,
  we_mp_rss_instance_url VARCHAR(255),  -- 独立we-mp-rss实例地址
  we_mp_rss_port INTEGER,               -- 独立端口
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **5. tenant_users (租户用户关联表)** 📋
```sql
CREATE TABLE tenant_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member',  -- admin/member
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);
```

#### **6. wechat_accounts (微信账号表)** 📋
```sql
CREATE TABLE wechat_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  account_name VARCHAR(100) NOT NULL,
  wechat_id VARCHAR(100),
  duixueqiu_account VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  last_publish_time TIMESTAMP,
  total_published INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **7. publish_tasks (发布任务表)** 📋
```sql
CREATE TABLE publish_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES wechat_articles(id) ON DELETE SET NULL,
  wechat_account_ids JSONB NOT NULL,
  content TEXT NOT NULL,
  images JSONB,
  publish_time TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  published_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔌 API接口设计

### 🔐 认证模块

#### **POST /api/auth/register**
用户注册
```json
Request:
{
  "username": "string",
  "email": "string",
  "password": "string"
}

Response:
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "string",
    "email": "string"
  }
}
```

#### **POST /api/auth/login**
用户登录
```json
Request:
{
  "email": "string",
  "password": "string"
}

Response:
{
  "success": true,
  "data": {
    "accessToken": "jwt_token",
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "role": "string"
    }
  }
}
```

### 📥 采集模块

#### **POST /api/collection/create**
创建采集任务
```json
Request:
{
  "articleUrl": "string"
}

Response:
{
  "success": true,
  "data": {
    "taskId": "uuid",
    "status": "processing"
  }
}
```

#### **GET /api/collection/:id**
获取采集结果
```json
Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "string",
    "content": "string",
    "images": ["url1", "url2"],
    "author": "string",
    "publishDate": "timestamp",
    "status": "completed"
  }
}
```

### ✍️ 改写模块

#### **POST /api/rewrite/create**
创建改写任务
```json
Request:
{
  "collectionId": "uuid",
  "content": "string"
}

Response:
{
  "success": true,
  "data": {
    "taskId": "uuid",
    "status": "processing"
  }
}
```

### 📤 发布模块

#### **POST /api/publish/create**
创建发布任务
```json
Request:
{
  "rewriteId": "uuid",
  "wechatAccountIds": ["uuid1", "uuid2"],
  "content": "string",
  "images": ["url1", "url2"],
  "publishTime": "timestamp"
}

Response:
{
  "success": true,
  "data": {
    "taskId": "uuid",
    "status": "scheduled"
  }
}
```

---

## 🎨 前端页面设计

### 📄 核心页面列表

1. **登录/注册页面** (`/login`, `/register`)
2. **仪表盘** (`/dashboard`)
3. **公众号采集** (`/collection`)
4. **文案改写** (`/rewrite`)
5. **发布管理** (`/publish`)
6. **微信账号管理** (`/accounts`)
7. **系统设置** (`/settings`)

### 🎯 页面功能详细设计

详见下一个文档文件...

---

## 🚀 部署方案

### 🌐 推荐部署架构

- **前端**: Vercel (免费)
- **后端**: Railway / Render (免费额度)
- **数据库**: Supabase (免费额度)
- **文件存储**: Supabase Storage (免费1GB)
- **Redis**: Upstash (免费10k请求/天)

### 💰 成本估算

- **开发阶段**: 完全免费
- **生产环境**: 100-200元/月

---

## 🚀 快速启动指南

### 📋 环境要求
- Node.js 18+
- Docker Desktop
- PostgreSQL (Supabase)

### 🔧 启动步骤

#### 1. 启动we-mp-rss服务
```bash
docker run -d \
  --name we-mp-rss \
  -p 8001:8000 \
  -e USERNAME=admin \
  -e PASSWORD=admin@123 \
  rachelos/we-mp-rss:latest
```

#### 2. 启动后端服务
```bash
cd 朋友圈自动发布系统/pyq-backend
npm install
npm run start:dev
```

#### 3. 访问前端页面
```
http://localhost:3001/login.html
http://localhost:3001/wechat-subscription.html
```

### ✅ 验证方法
1. 访问登录页面,使用测试账号登录
2. 进入公众号监控页面
3. 查看订阅列表和文章列表

---

## 📅 开发计划

### 第一阶段 - MVP版本 (已完成) ✅
- ✅ 用户认证系统
- ✅ we-mp-rss集成
- ✅ 公众号监控功能
- ✅ 文章管理功能
- ✅ 定时同步功能
- ✅ 图片代理功能

### 第二阶段 - 核心功能 (进行中) 🔄
- 📋 AI智能改写功能
- 📋 Puppeteer自动化
- 📋 堆雪球系统集成
- 📋 定时发布功能

### 第三阶段 - SaaS升级 (规划中) 📋
- 📋 多租户架构设计
- 📋 we-mp-rss多实例部署
- 📋 租户管理系统
- 📋 资源隔离和调度
- 📋 计费系统

---

## 🎯 架构演进路线

### 当前阶段: 共享账号模式
**特点**:
- ✅ 管理员统一管理订阅
- ✅ 团队成员共享文章库
- ✅ 快速上线,验证产品价值
- ✅ 单一we-mp-rss实例

**适用场景**: 小团队内部使用(3-10人)

### 未来阶段: 多租户SaaS模式
**特点**:
- 🚀 每个租户独立we-mp-rss实例
- 🚀 完全的数据隔离
- 🚀 支持大规模用户
- 🚀 按需资源分配

**适用场景**: 商业化SaaS产品(100+企业用户)

**技术挑战**:
1. **实例编排**: Docker Swarm或Kubernetes管理多实例
2. **资源调度**: 动态分配端口和资源
3. **成本控制**: 按需启动/停止实例
4. **数据迁移**: 从共享模式迁移到隔离模式

---

## 🛠️ 故障排查指南

### 问题1: 监控设置保存失败
**错误**: `duplicate key value violates unique constraint`
**原因**: upsert操作缺少onConflict参数
**解决**: 已修复,添加`onConflict: 'config_key'`参数

### 问题2: 二维码不显示
**原因**: we-mp-rss已登录,不会生成新二维码
**解决**:
- 方案1: 重启Docker容器 `docker restart we-mp-rss`
- 方案2: 等待登录过期后重新扫码

### 问题3: 图片无法加载
**原因**: 微信图片服务器跨域限制
**解决**: 使用后端图片代理功能

---

## 📋 下一步计划

### 🔄 进行中
- 完善文档和注释
- 优化用户体验

### 📝 待办事项
- AI改写功能开发
- Puppeteer自动化开发
- 堆雪球系统集成
- 定时发布功能

### ⚠️ 已知问题
- we-mp-rss为单用户系统,暂不支持多租户
- 需要手动扫码登录微信公众平台
- 登录状态过期后需要重新扫码

---

**文档版本**: V3.0
**最后更新**: 2025年10月24日
**负责团队**: 小牛马 + 打工人
**产品定位**: MVP → SaaS渐进式演进

