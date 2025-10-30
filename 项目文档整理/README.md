# 朋友圈自动发布系统

<div align="center">

**全自动化的微信朋友圈发布系统**

从公众号文章采集 → AI智能改写 → 多账号定时发布的全流程自动化

[![Version](https://img.shields.io/badge/version-3.7-blue.svg)](https://github.com/your-repo)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-20.19.5-brightgreen.svg)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0+-red.svg)](https://nestjs.com/)

[在线演示](https://autochat.lfdhk.com) | [快速开始](#-快速开始) | [部署指南](#-生产部署) | [常见问题](#-常见问题)

</div>

---

## 📖 目录

- [项目简介](#-项目简介)
- [核心功能](#-核心功能)
- [技术栈](#-技术栈)
- [快速开始](#-快速开始)
- [生产部署](#-生产部署)
- [版本更新](#-版本更新)
- [功能说明](#-功能说明)
- [常见问题](#-常见问题)
- [更新日志](#-更新日志)
- [📚 相关文档](#-相关文档)

---

## 🎯 项目简介

### 产品定位

- **当前阶段**: 小团队内部使用的MVP版本
- **未来目标**: 多租户SaaS产品,支持大规模用户

### 核心价值

✅ **自动化采集** - 监控公众号新文章,自动采集内容和图片  
✅ **AI智能改写** - 基于Coze API,一键生成3个版本文案  
✅ **定时发布** - 支持立即/定时发布,随机延迟更自然  
✅ **跟圈功能** - 自动发布多条相同内容,定时删除旧朋友圈  
✅ **多账号管理** - 支持管理多个堆雪球账号

### 在线演示

🌐 **访问地址**: [https://autochat.lfdhk.com](https://autochat.lfdhk.com)

**测试账号**: 请联系管理员获取

---

## ✨ 核心功能

### 已实现功能 ✅

#### 1. 微信公众号监控
- 扫码登录微信公众平台
- 订阅管理(添加/删除/手动更新)
- 历史文章导入
- 定时自动同步
- 文章详情查看(含图片代理)

#### 2. AI智能改写
- 并发生成3个版本文案
- 可编辑改写结果
- 保存改写历史
- 图片管理(上传/删除/排序)

#### 3. 自动发布管理
- 创建发布任务(支持立即/定时发布)
- 任务列表展示(状态跟踪)
- 图片自动下载到本地
- 自动上传图片到堆雪球
- Puppeteer自动化发布
- 定时任务调度(每分钟检查)
- 随机延迟发布(更自然)

#### 4. 自动化脚本系统
- **Script 1**: 输入链接自动发布 - 一键完成采集、转写、发布全流程
- **Script 3**: 定时监控自动发布 - 定时检查订阅的公众号新文章
- **Script 4**: 跟圈自动化 - 自动发布多条相同内容并定时删除旧朋友圈

#### 5. 用户认证系统
- 用户注册/登录
- JWT Token管理
- 权限控制

### 待实现功能 📋

- 多账号管理优化
- 数据统计和效果追踪
- 发布结果验证
- 手机端适配优化

---

## 🛠️ 技术栈

### 前端
- **框架**: Vue 3 (CDN版本)
- **UI设计**: 自定义白色基调设计
- **HTTP客户端**: Fetch API
- **状态管理**: Vue 3 Composition API

### 后端
- **框架**: NestJS 10.0+
- **语言**: TypeScript 5.0+
- **数据库**: PostgreSQL 15+ (Supabase托管)
- **认证**: JWT + Passport
- **定时任务**: @nestjs/schedule + luxon
- **文件存储**: Supabase Storage

### 自动化
- **浏览器自动化**: Puppeteer 21.0+
- **公众号采集**: we-mp-rss (Docker部署)
- **AI改写**: Coze API v3
- **堆雪球集成**: 表单自动填写 + 文件上传

---

## 🚀 快速开始

### 📋 环境要求

- **Node.js**: 20.19.5+ (推荐使用nvm管理)
- **Docker**: 最新版本 (用于we-mp-rss)
- **数据库**: Supabase账号 (免费)
- **操作系统**: macOS / Linux / Windows

### 🔧 本地开发步骤

#### 1️⃣ 克隆项目

```bash
git clone [项目地址]
cd 朋友圈自动发布系统
```

#### 2️⃣ 配置环境变量

在 `pyq-backend` 目录创建 `.env` 文件:

```env
# Supabase配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT配置
JWT_SECRET=your-jwt-secret

# Coze API配置
COZE_API_KEY=your-coze-api-key
COZE_BOT_ID=your-bot-id

# we-mp-rss配置
WE_MP_RSS_URL=http://localhost:8001
WE_MP_RSS_USERNAME=admin
WE_MP_RSS_PASSWORD=admin@123

# 堆雪球配置
DUIXUEQIU_USERNAME=your-username
DUIXUEQIU_PASSWORD=your-password
```

#### 3️⃣ 启动we-mp-rss服务

```bash
docker run -d \
  --name we-mp-rss \
  -p 8001:8001 \
  -v $(pwd)/we-mp-rss-data:/app/data \
  -e ENABLE_JOB=True \
  -e SPAN_INTERVAL=3600 \
  ghcr.io/rachelos/we-mp-rss:latest
```

#### 4️⃣ 安装依赖并启动后端

```bash
cd pyq-backend
npm install
npm run start:dev
```

#### 5️⃣ 访问前端页面

打开浏览器访问:
- **登录页面**: http://localhost:3000/login.html
- **主页**: http://localhost:3000/index.html
- **公众号监控**: http://localhost:3000/wechat-monitor.html

### ✅ 验证安装

1. 访问登录页面,注册新账号
2. 登录后进入公众号监控页面
3. 扫码登录微信公众平台
4. 添加订阅测试

---

## 🚀 生产部署

### 📋 服务器环境要求

- **操作系统**: CentOS 7.x / 8.x
- **宝塔面板**: 7.x+
- **Node.js**: 20.19.5 (通过nvm管理)
- **Docker**: 最新版本
- **Nginx**: 1.20+

### 🔧 初始部署步骤

#### 1️⃣ 安装宝塔面板

```bash
# CentOS 7.x
yum install -y wget && wget -O install.sh http://download.bt.cn/install/install_6.0.sh && sh install.sh

# 安装完成后访问面板
https://服务器IP:8888
```

#### 2️⃣ 安装必要软件

在宝塔面板中安装:
- **Nginx** 1.20+
- **PM2管理器** (应用商店搜索安装)
- **Docker管理器** (可选,用于we-mp-rss)

#### 3️⃣ 安装Node.js (使用nvm)

```bash
# SSH连接服务器后执行

# 1. 安装nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# 2. 安装Node.js 20.19.5
nvm install 20.19.5
nvm use 20.19.5
nvm alias default 20.19.5

# 3. 验证安装
node -v  # 应显示 v20.19.5
npm -v
```

#### 4️⃣ 创建项目目录

```bash
# 创建项目根目录
mkdir -p /www/wwwroot/pyq-backend

# 设置权限
chmod 755 /www/wwwroot/pyq-backend
```

#### 5️⃣ 上传项目文件

**方法1: 使用部署脚本** (推荐)

在本地项目目录执行:
```bash
cd 朋友圈自动发布系统
./deploy-update.sh
```

**方法2: 手动上传**

1. 在宝塔面板 → 文件 → 上传文件
2. 上传 `pyq-backend` 和 `pyq-frontend` 文件夹
3. 解压到 `/www/wwwroot/pyq-backend/`

#### 6️⃣ 安装依赖

```bash
cd /www/wwwroot/pyq-backend/pyq-backend
npm install
```

#### 7️⃣ 编译TypeScript

```bash
npm run build
```

#### 8️⃣ 配置PM2启动

在宝塔面板 → PM2管理器 → 添加项目:

- **项目名称**: pyq-backend
- **启动文件**: `/www/wwwroot/pyq-backend/pyq-backend/dist/main.js`
- **运行目录**: `/www/wwwroot/pyq-backend/pyq-backend`
- **Node版本**: 20.19.5

或使用命令行:
```bash
pm2 start /www/wwwroot/pyq-backend/pyq-backend/dist/main.js --name pyq-backend
pm2 save
pm2 startup
```

#### 9️⃣ 配置Nginx

在宝塔面板 → 网站 → 添加站点:

1. **创建网站**:
   - 域名: `autochat.lfdhk.com`
   - 根目录: `/www/wwwroot/pyq-backend/pyq-frontend`
   - PHP版本: 纯静态

2. **配置SSL证书**:
   - 申请Let's Encrypt免费证书
   - 或上传已有证书
   - 开启强制HTTPS

3. **配置反向代理**:

   在网站设置 → 配置文件中添加:
   ```nginx
   location /api {
       proxy_pass http://127.0.0.1:3000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
   }
   ```

4. **重载Nginx**:
   ```bash
   nginx -s reload
   ```

#### 🔟 部署we-mp-rss (Docker)

```bash
# 1. 拉取镜像
docker pull ghcr.io/rachelos/we-mp-rss:latest

# 2. 创建数据目录
mkdir -p /www/wwwroot/we-mp-rss-data

# 3. 启动容器
docker run -d \
  --name we-mp-rss \
  -p 8001:8001 \
  -v /www/wwwroot/we-mp-rss-data:/app/data \
  -e ENABLE_JOB=True \
  -e SPAN_INTERVAL=3600 \
  -e CUSTOM_WEBHOOK=https://autochat.lfdhk.com/api/wechat-monitor/webhook \
  ghcr.io/rachelos/we-mp-rss:latest

# 4. 验证运行
docker ps
```

#### 1️⃣1️⃣ 配置防火墙

在宝塔面板 → 安全 → 放行端口:
- 80 (HTTP)
- 443 (HTTPS)
- 3000 (Node.js,仅内网)
- 8001 (we-mp-rss,仅内网)

或使用命令行:
```bash
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --reload
```

#### 1️⃣2️⃣ 验证部署

```bash
# 1. 检查Node.js服务
pm2 list
pm2 logs pyq-backend

# 2. 检查端口监听
netstat -tlnp | grep :3000

# 3. 测试API
curl http://127.0.0.1:3000/health

# 4. 测试HTTPS
curl https://autochat.lfdhk.com/api/health

# 5. 检查Docker容器
docker ps
```

---

## 🔄 版本更新

### 方法1: 一键部署脚本 (推荐) ✅

在本地项目目录执行:

```bash
cd 朋友圈自动发布系统
./deploy-update.sh
```

**或者双击文件**:
```
一键部署.command
```

**脚本自动完成**:
1. ✅ 编译TypeScript代码
2. ✅ 上传后端文件到服务器
3. ✅ 上传前端文件到服务器
4. ✅ 重启PM2服务
5. ✅ 显示部署结果

### 方法2: 手动部署

**步骤1: 本地编译**
```bash
cd 朋友圈自动发布系统/pyq-backend
npm run build
```

**步骤2: 上传文件**

使用宝塔面板文件管理或SFTP工具上传:
- `pyq-backend/dist/` → `/www/wwwroot/pyq-backend/pyq-backend/dist/`
- `pyq-backend/package.json` → `/www/wwwroot/pyq-backend/pyq-backend/`
- `pyq-frontend/` → `/www/wwwroot/pyq-backend/pyq-frontend/`

**步骤3: 重启服务**
```bash
# SSH连接服务器后执行
pm2 restart pyq-backend
pm2 logs pyq-backend
```

---

## 📚 功能说明

### 1. 公众号监控

#### 登录微信公众平台
1. 进入"公众号监控"页面
2. 点击"扫码登录"按钮
3. 使用微信扫描二维码
4. 登录成功后可以管理订阅

#### 添加订阅
1. 在搜索框输入公众号名称
2. 点击"搜索"按钮
3. 在搜索结果中点击"添加订阅"
4. 系统自动导入历史文章

#### 手动同步
1. 在订阅列表中点击"同步"按钮
2. 系统立即同步该公众号的新文章

### 2. AI智能改写

#### 改写文章
1. 在文章列表中点击"转写"按钮
2. 系统自动跳转到改写页面
3. 点击"开始转写"按钮
4. 等待AI生成3个版本文案
5. 编辑满意的版本

#### 图片管理
1. 点击"上传图片"添加新图片
2. 拖拽图片调整顺序
3. 点击"删除"移除图片
4. 最多支持9张图片

### 3. 自动发布

#### 创建发布任务
1. 选择改写后的文案版本
2. 点击"发布到朋友圈"
3. 填写任务信息:
   - 任务标题
   - 选择堆雪球账号
   - 设置发布时间
4. 点击"确定"创建任务

#### 查看任务状态
1. 进入"任务管理"页面
2. 查看任务列表和状态
3. 等待任务自动执行

### 4. 跟圈自动化

#### 创建跟圈任务
1. 进入"自动化脚本"页面
2. 选择"Script 4: 跟圈自动化"
3. 填写参数:
   - 跟圈次数
   - 间隔时间
   - 文案内容
   - 上传图片
4. 点击"执行"开始跟圈

#### 跟圈流程
1. 立即发布第1条朋友圈
2. 按间隔时间发布后续朋友圈
3. 发布新朋友圈前自动删除上一条
4. 最后一条朋友圈保留不删除

---

## ❓ 常见问题

### 部署相关

#### Q1: Node.js版本不对怎么办?
**A**: 使用nvm切换版本:
```bash
nvm use 20.19.5
```

#### Q2: PM2服务无法启动?
**A**: 检查日志:
```bash
pm2 logs pyq-backend --lines 50
```

#### Q3: 502错误怎么解决?
**A**: 检查Node.js服务是否运行:
```bash
pm2 list
netstat -tlnp | grep :3000
```

### 功能相关

#### Q4: we-mp-rss登录失效?
**A**: 重启Docker容器:
```bash
docker restart we-mp-rss
```

#### Q5: 图片无法加载?
**A**: 使用后端图片代理功能,已自动配置

#### Q6: Coze API返回"in_progress"?
**A**: 系统已实现轮询机制,会自动等待结果

### 性能相关

#### Q7: 如何提高发布速度?
**A**: 调整定时任务间隔,修改cron表达式

#### Q8: 如何减少服务器资源占用?
**A**: 使用headless模式运行Puppeteer

---

## 📅 更新日志

### V3.8 (2025-10-30)
- ✅ **重大修复**: 修复Script 1提交按钮点击失败问题
  - **问题**: 复杂的对话框查找逻辑导致无法找到确定按钮
  - **解决**: 简化为与Script 4相同的简单逻辑,使用`includes('确定')`
  - **影响**: Script 1现在可以成功创建堆雪球任务
- ✅ 新增堆雪球自动化操作文档 (详见下方)
- ✅ 优化浏览器console日志转发到PM2日志

### V3.7 (2025-10-28)
- ✅ 新增宝塔面板部署指南
- ✅ 新增版本更新流程
- ✅ 优化README结构
- ✅ 新增服务器常用命令文档

### V3.6 (2025-10-20)
- ✅ 完成跟圈自动化功能
- ✅ 修复时间计算问题
- ✅ 优化Puppeteer headless模式

### V3.5 (2025-10-15)
- ✅ 完成AI智能改写功能
- ✅ 完成自动发布管理
- ✅ 完成图片上传功能

### V3.0 (2025-10-01)
- ✅ 完成公众号监控功能
- ✅ 完成用户认证系统
- ✅ 完成文章管理功能

---

## � 相关文档

### 核心技术文档

- **[堆雪球自动化操作指南](./堆雪球自动化操作指南.md)** ⭐ 重要
  - Script 1和Script 4的完整操作流程
  - 关键技术要点和最佳实践
  - 常见问题排查和解决方案
  - 调试技巧和日志分析

### 其他文档

- **项目架构设计** (待补充)
- **API接口文档** (待补充)
- **数据库设计文档** (待补充)

---

## �📞 联系方式

- **项目地址**: [GitHub](https://github.com/your-repo)
- **在线演示**: [https://autochat.lfdhk.com](https://autochat.lfdhk.com)
- **技术支持**: 请提交Issue

---

## 📄 许可证

MIT License

---

<div align="center">

**Made with ❤️ by 刀仔老板团队**

</div>

