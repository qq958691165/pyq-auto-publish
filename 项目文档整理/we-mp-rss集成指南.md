# we-mp-rss集成指南

## 📋 项目概述

本文档详细说明如何将we-mp-rss微信公众号监控系统集成到朋友圈自动发布系统中。

---

## 🎯 集成架构

```
用户在Web系统添加对标公众号
  ↓
后端调用we-mp-rss API添加订阅
  ↓
we-mp-rss定时检查公众号(每1小时)
  ↓
发现新文章 → 自动采集数据
  ↓
通过Webhook推送到后端
  ↓
后端接收Webhook数据:
  - 文章标题
  - 文章正文(HTML格式)
  - 图片URL列表
  - 发布时间
  ↓
保存到飞书多维表格
  ↓
触发Coze工作流改写文案
  ↓
下载图片到本地
  ↓
调用Puppeteer自动化堆雪球
  ↓
自动发布到微信朋友圈
```

---

## 🚀 部署步骤

### 第一步: 部署we-mp-rss服务

#### 1.1 使用Docker部署

```bash
# 1. 拉取Docker镜像
docker pull ghcr.io/rachelos/we-mp-rss:latest

# 2. 创建数据目录
mkdir -p ./we-mp-rss-data

# 3. 启动服务
docker run -d \
  --name we-mp-rss \
  -p 8001:8001 \
  -v ./we-mp-rss-data:/app/data \
  -e ENABLE_JOB=True \
  -e SPAN_INTERVAL=3600 \
  -e CUSTOM_WEBHOOK=http://您的服务器IP:3000/api/wechat-monitor/webhook \
  ghcr.io/rachelos/we-mp-rss:latest
```

#### 1.2 环境变量说明

| 环境变量 | 说明 | 推荐值 |
|---------|------|--------|
| `ENABLE_JOB` | 是否启用定时任务 | `True` |
| `SPAN_INTERVAL` | 定时任务间隔(秒) | `3600` (1小时) |
| `CUSTOM_WEBHOOK` | Webhook推送地址 | `http://您的IP:3000/api/wechat-monitor/webhook` |
| `MAX_PAGE` | 最大采集页数 | `5` |
| `THREADS` | 线程数 | `2` |

#### 1.3 访问we-mp-rss管理界面

```
http://您的服务器IP:8001
```

**默认账号密码**:
- 账号: `admin`
- 密码: `admin@123`

#### 1.4 微信扫码授权

1. 登录we-mp-rss管理界面
2. 点击"扫码授权"
3. 使用微信扫描二维码
4. 授权成功后即可开始使用

---

### 第二步: 配置后端环境变量

在 `朋友圈自动发布系统/pyq-backend/.env` 文件中添加以下配置:

```env
# we-mp-rss配置
WE_MP_RSS_URL=http://localhost:8001
WE_MP_RSS_TOKEN=your-api-token-here

# 飞书配置
FEISHU_APP_ID=your-feishu-app-id
FEISHU_APP_SECRET=your-feishu-app-secret
FEISHU_TABLE_ID=your-feishu-table-id

# Coze配置
COZE_API_KEY=your-coze-api-key
COZE_WORKFLOW_ID=your-coze-workflow-id

# Puppeteer服务配置
PUPPETEER_SERVICE_URL=http://localhost:3002
```

---

### 第三步: 安装依赖并启动后端

```bash
# 进入后端目录
cd 朋友圈自动发布系统/pyq-backend

# 安装依赖
npm install

# 启动开发服务器
npm run start:dev
```

---

### 第四步: 启动前端

```bash
# 使用任意HTTP服务器启动前端
# 方法1: 使用Python
cd 朋友圈自动发布系统/pyq-frontend
python -m http.server 8080

# 方法2: 使用Node.js http-server
npx http-server -p 8080

# 访问地址
http://localhost:8080
```

---

## 🔧 使用指南

### 1. 添加公众号订阅

#### 方法1: 通过Web界面添加

1. 登录朋友圈自动发布系统
2. 点击左侧菜单"公众号监控"
3. 在"添加公众号订阅"卡片中输入公众号名称
4. 点击"添加订阅"按钮

#### 方法2: 通过API添加

```bash
curl -X POST http://localhost:3000/api/wechat-monitor/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"accountName": "公众号名称"}'
```

---

### 2. 查看订阅列表

在"公众号监控"页面的"订阅列表"卡片中可以看到:
- 公众号名称
- 订阅时间
- 最新文章
- 状态(正常/异常)
- 操作按钮(手动更新/删除)

---

### 3. 查看最新文章

在"公众号监控"页面的"最新文章"卡片中可以看到:
- 文章标题
- 公众号名称
- 发布时间
- 处理状态(待处理/已发布)
- 操作按钮(查看详情)

---

## 📊 Webhook数据格式

we-mp-rss推送到后端的Webhook数据格式:

```json
{
  "title": "文章标题",
  "content": "<p>文章正文HTML内容</p>",
  "author": "公众号名称",
  "publish_time": "2025-10-23 09:00:00",
  "url": "https://mp.weixin.qq.com/s/xxxxx",
  "account_id": "公众号ID",
  "images": [
    "https://mmbiz.qpic.cn/xxx.jpg",
    "https://mmbiz.qpic.cn/yyy.jpg"
  ]
}
```

---

## 🔄 自动化流程

### 完整流程说明

1. **we-mp-rss定时检查** - 每1小时自动检查订阅的公众号是否有新文章
2. **发现新文章** - 自动采集文章标题、正文、图片、发布时间等数据
3. **Webhook推送** - 将文章数据推送到后端 `/api/wechat-monitor/webhook` 接口
4. **后端处理** - 后端接收数据后执行以下操作:
   - 保存到飞书多维表格
   - 触发Coze工作流改写文案
   - 下载图片到本地
   - 调用Puppeteer自动化堆雪球
   - 自动发布到微信朋友圈

---

## 🛠️ 故障排查

### 问题1: we-mp-rss服务无法启动

**解决方案**:
```bash
# 检查Docker容器状态
docker ps -a

# 查看容器日志
docker logs we-mp-rss

# 重启容器
docker restart we-mp-rss
```

---

### 问题2: Webhook推送失败

**检查清单**:
1. 确认后端服务正常运行
2. 确认Webhook地址配置正确
3. 确认防火墙允许8001端口访问
4. 查看we-mp-rss日志

**查看日志**:
```bash
docker logs we-mp-rss | grep webhook
```

---

### 问题3: 扫码授权失效

**解决方案**:
1. 重新登录we-mp-rss管理界面
2. 点击"扫码授权"
3. 使用微信重新扫码授权

---

### 问题4: 订阅列表为空

**检查清单**:
1. 确认we-mp-rss服务正常运行
2. 确认后端API地址配置正确
3. 检查浏览器控制台是否有错误
4. 确认后端CORS配置正确

---

## 📝 API接口文档

### 1. 添加订阅

```
POST /api/wechat-monitor/subscriptions
```

**请求体**:
```json
{
  "accountName": "公众号名称"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "订阅ID",
    "name": "公众号名称",
    "createdAt": "2025-10-23 09:00:00"
  }
}
```

---

### 2. 获取订阅列表

```
GET /api/wechat-monitor/subscriptions
```

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "订阅ID",
      "name": "公众号名称",
      "createdAt": "2025-10-23 09:00:00",
      "latestArticle": "最新文章标题",
      "status": "正常"
    }
  ]
}
```

---

### 3. 删除订阅

```
DELETE /api/wechat-monitor/subscriptions/:id
```

**响应**:
```json
{
  "success": true,
  "message": "删除成功"
}
```

---

### 4. 手动触发更新

```
POST /api/wechat-monitor/subscriptions/:id/update
```

**响应**:
```json
{
  "success": true,
  "message": "更新成功"
}
```

---

## 🎯 最佳实践

### 1. 监控频率设置

- **推荐间隔**: 1小时(3600秒)
- **最小间隔**: 10秒(不推荐,容易触发限流)
- **最大间隔**: 24小时(86400秒)

### 2. 订阅数量控制

- **推荐数量**: 50个以内
- **最大数量**: 100个
- **超过100个**: 建议部署多个we-mp-rss实例

### 3. 数据备份

定期备份we-mp-rss数据目录:
```bash
tar -czf we-mp-rss-backup-$(date +%Y%m%d).tar.gz ./we-mp-rss-data
```

---

## 📞 技术支持

- **we-mp-rss项目**: https://github.com/rachelos/we-mp-rss
- **项目Issues**: https://github.com/rachelos/we-mp-rss/issues
- **项目文档**: 查看项目README.md

---

## 🔗 相关链接

- [we-mp-rss GitHub仓库](https://github.com/rachelos/we-mp-rss)
- [Docker Hub](https://hub.docker.com/)
- [飞书开放平台](https://open.feishu.cn/)
- [Coze平台](https://www.coze.cn/)

