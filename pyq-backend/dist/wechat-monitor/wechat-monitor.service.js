"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WechatMonitorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatMonitorService = void 0;
const common_1 = require("@nestjs/common");
const we_mp_rss_service_1 = require("./we-mp-rss.service");
const articles_service_1 = require("../articles/articles.service");
const axios_1 = __importDefault(require("axios"));
let WechatMonitorService = WechatMonitorService_1 = class WechatMonitorService {
    constructor(weMpRssService, articlesService) {
        this.weMpRssService = weMpRssService;
        this.articlesService = articlesService;
        this.logger = new common_1.Logger(WechatMonitorService_1.name);
    }
    async handleArticleWebhook(articleData) {
        try {
            this.logger.log(`收到新文章推送: ${articleData.title}`);
            const images = this.extractImages(articleData.content);
            const article = {
                title: articleData.title,
                content: articleData.content,
                images: images,
                publish_time: articleData.publish_time,
                author: articleData.author,
                url: articleData.url,
                account_name: articleData.account_name || '未知公众号',
                account_id: articleData.account_id,
            };
            const savedArticle = await this.articlesService.createArticle(article);
            this.logger.log(`文章已保存到数据库: ${savedArticle.id}`);
            this.processArticleAsync(savedArticle.id, article).catch((error) => {
                this.logger.error(`文章异步处理失败: ${error.message}`);
            });
            return {
                success: true,
                message: '文章接收成功',
                articleId: savedArticle.id,
            };
        }
        catch (error) {
            this.logger.error(`文章处理失败: ${error.message}`);
            throw error;
        }
    }
    async processArticleAsync(articleId, article) {
        try {
            await this.articlesService.updateArticleStatus(articleId, '改写中');
            const rewrittenContent = await this.triggerCozeWorkflow(article);
            await this.articlesService.updateArticleStatus(articleId, '已改写', rewrittenContent);
            const localImages = await this.downloadImages(article.images);
            await this.articlesService.updateArticleStatus(articleId, '发布中');
            await this.publishToDuixueqiu({
                content: rewrittenContent,
                images: localImages,
            });
            await this.articlesService.updateArticleStatus(articleId, '已发布');
            this.logger.log(`文章处理完成: ${article.title}`);
        }
        catch (error) {
            await this.articlesService.updateArticleStatus(articleId, '失败');
            this.logger.error(`文章处理失败: ${error.message}`);
            throw error;
        }
    }
    extractImages(htmlContent) {
        const images = [];
        const imgRegex = /<img[^>]+src="([^">]+)"/g;
        let match;
        while ((match = imgRegex.exec(htmlContent)) !== null) {
            images.push(match[1]);
        }
        return images;
    }
    async saveToFeishu(article) {
        try {
            const feishuAppId = process.env.FEISHU_APP_ID;
            const feishuAppSecret = process.env.FEISHU_APP_SECRET;
            const feishuTableId = process.env.FEISHU_TABLE_ID;
            const tokenResponse = await axios_1.default.post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
                app_id: feishuAppId,
                app_secret: feishuAppSecret,
            });
            const accessToken = tokenResponse.data.tenant_access_token;
            await axios_1.default.post(`https://open.feishu.cn/open-apis/bitable/v1/apps/${feishuTableId}/tables/tblxxxxxx/records`, {
                fields: {
                    '标题': article.title,
                    '正文': article.content,
                    '图片': article.images.join(','),
                    '发布时间': article.publishTime,
                    '作者': article.author,
                    '原文链接': article.url,
                    '状态': '待处理',
                },
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            this.logger.log(`文章已保存到飞书: ${article.title}`);
        }
        catch (error) {
            this.logger.error(`保存到飞书失败: ${error.message}`);
            throw error;
        }
    }
    async triggerCozeWorkflow(article) {
        try {
            const cozeApiKey = process.env.COZE_API_KEY;
            const cozeWorkflowId = process.env.COZE_WORKFLOW_ID;
            const response = await axios_1.default.post(`https://api.coze.cn/v1/workflow/run`, {
                workflow_id: cozeWorkflowId,
                parameters: {
                    title: article.title,
                    content: article.content,
                },
            }, {
                headers: {
                    'Authorization': `Bearer ${cozeApiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            const rewrittenContent = response.data.data.output;
            this.logger.log(`文案改写完成: ${article.title}`);
            return rewrittenContent;
        }
        catch (error) {
            this.logger.error(`Coze工作流调用失败: ${error.message}`);
            throw error;
        }
    }
    async downloadImages(imageUrls) {
        const localPaths = [];
        for (const url of imageUrls) {
            try {
                const response = await axios_1.default.get(url, { responseType: 'arraybuffer' });
                const fileName = `image_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
                const filePath = `./uploads/${fileName}`;
                const fs = require('fs');
                fs.writeFileSync(filePath, response.data);
                localPaths.push(filePath);
                this.logger.log(`图片下载成功: ${fileName}`);
            }
            catch (error) {
                this.logger.error(`图片下载失败: ${url}`);
            }
        }
        return localPaths;
    }
    async publishToDuixueqiu(data) {
        try {
            const puppeteerServiceUrl = process.env.PUPPETEER_SERVICE_URL || 'http://localhost:3002';
            await axios_1.default.post(`${puppeteerServiceUrl}/api/publish`, {
                content: data.content,
                images: data.images,
            });
            this.logger.log('堆雪球发布成功');
        }
        catch (error) {
            this.logger.error(`堆雪球发布失败: ${error.message}`);
            throw error;
        }
    }
    async importHistoryArticles(mpId, limit) {
        try {
            this.logger.log(`开始导入历史文章... mpId: ${mpId}, limit: ${limit}`);
            let page = 0;
            const pageSize = 20;
            let totalImported = 0;
            let hasMore = true;
            while (hasMore && (!limit || totalImported < limit)) {
                this.logger.log(`正在获取第 ${page + 1} 页文章...`);
                const response = await this.weMpRssService.getArticles(mpId, page, pageSize);
                this.logger.log(`获取到响应: ${JSON.stringify(response).substring(0, 200)}...`);
                if (!response.data || !response.data.list || response.data.list.length === 0) {
                    this.logger.log(`没有更多文章了,退出循环`);
                    hasMore = false;
                    break;
                }
                const articles = response.data.list;
                this.logger.log(`本页获取到 ${articles.length} 篇文章`);
                for (const article of articles) {
                    if (limit && totalImported >= limit) {
                        hasMore = false;
                        break;
                    }
                    try {
                        const existingArticle = await this.articlesService.findByUrl(article.url);
                        if (existingArticle) {
                            this.logger.log(`文章已存在,跳过: ${article.title}`);
                            continue;
                        }
                        let fullContent = article.content || '';
                        try {
                            this.logger.log(`正在获取文章完整正文: ${article.title}`);
                            const detailResponse = await this.weMpRssService.getArticleDetail(article.id);
                            if (detailResponse?.data?.content) {
                                fullContent = detailResponse.data.content;
                                this.logger.log(`成功获取完整正文,长度: ${fullContent.length} 字符`);
                            }
                        }
                        catch (detailError) {
                            this.logger.warn(`获取文章详情失败,使用摘要: ${detailError.message}`);
                        }
                        const images = this.extractImages(fullContent);
                        const publishDate = new Date(article.publish_time * 1000).toISOString();
                        await this.articlesService.createArticle({
                            title: article.title,
                            content: fullContent,
                            images: images,
                            publish_time: publishDate,
                            author: article.author,
                            url: article.url,
                            account_name: article.mp_name || '未知公众号',
                            account_id: article.mp_id,
                        });
                        totalImported++;
                        this.logger.log(`导入文章成功 (${totalImported}): ${article.title}`);
                    }
                    catch (error) {
                        this.logger.error(`导入文章失败: ${article.title}, ${error.message}`);
                    }
                }
                page++;
            }
            this.logger.log(`历史文章导入完成,共导入 ${totalImported} 篇文章`);
            return {
                success: true,
                message: `成功导入 ${totalImported} 篇历史文章`,
                totalImported,
            };
        }
        catch (error) {
            this.logger.error(`导入历史文章失败: ${error.message}`);
            throw error;
        }
    }
    async syncArticles() {
        try {
            this.logger.log('开始同步文章...');
            const response = await this.weMpRssService.getArticles(undefined, 0, 20);
            if (!response.data || !response.data.data) {
                return {
                    success: true,
                    message: '没有新文章需要同步',
                    synced: 0,
                };
            }
            const articles = response.data.data;
            let synced = 0;
            for (const article of articles) {
                try {
                    const existingArticle = await this.articlesService.findByUrl(article.url);
                    if (existingArticle) {
                        continue;
                    }
                    const images = this.extractImages(article.content);
                    await this.articlesService.createArticle({
                        title: article.title,
                        content: article.content,
                        images: images,
                        publish_time: article.publish_time,
                        author: article.author,
                        url: article.url,
                        account_name: article.mp_name || '未知公众号',
                        account_id: article.mp_id,
                    });
                    synced++;
                    this.logger.log(`同步新文章: ${article.title}`);
                }
                catch (error) {
                    this.logger.error(`同步文章失败: ${article.title}, ${error.message}`);
                }
            }
            this.logger.log(`文章同步完成,共同步 ${synced} 篇新文章`);
            return {
                success: true,
                message: `成功同步 ${synced} 篇新文章`,
                synced,
            };
        }
        catch (error) {
            this.logger.error(`同步文章失败: ${error.message}`);
            throw error;
        }
    }
    async deleteArticlesByAccountId(accountId) {
        try {
            this.logger.log(`开始删除公众号 ${accountId} 的所有文章`);
            const result = await this.articlesService.deleteArticlesByAccountId(accountId);
            this.logger.log(`成功删除公众号 ${accountId} 的所有文章`);
            return result;
        }
        catch (error) {
            this.logger.error(`删除公众号文章失败: ${error.message}`);
            throw error;
        }
    }
};
exports.WechatMonitorService = WechatMonitorService;
exports.WechatMonitorService = WechatMonitorService = WechatMonitorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [we_mp_rss_service_1.WeMpRssService,
        articles_service_1.ArticlesService])
], WechatMonitorService);
//# sourceMappingURL=wechat-monitor.service.js.map