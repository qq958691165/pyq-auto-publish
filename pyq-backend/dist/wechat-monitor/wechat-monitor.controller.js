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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WechatMonitorController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatMonitorController = void 0;
const common_1 = require("@nestjs/common");
const wechat_monitor_service_1 = require("./wechat-monitor.service");
const we_mp_rss_service_1 = require("./we-mp-rss.service");
const axios_1 = __importDefault(require("axios"));
let WechatMonitorController = WechatMonitorController_1 = class WechatMonitorController {
    constructor(wechatMonitorService, weMpRssService) {
        this.wechatMonitorService = wechatMonitorService;
        this.weMpRssService = weMpRssService;
        this.logger = new common_1.Logger(WechatMonitorController_1.name);
    }
    async handleWebhook(articleData) {
        this.logger.log('收到we-mp-rss Webhook推送');
        return await this.wechatMonitorService.handleArticleWebhook(articleData);
    }
    async getQrCode() {
        return await this.weMpRssService.getQrCode();
    }
    async getQrImage(res) {
        try {
            const imageBuffer = await this.weMpRssService.getQrImage();
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.send(imageBuffer);
        }
        catch (error) {
            this.logger.error(`获取二维码图片失败: ${error.message}`);
            res.status(500).json({
                code: -1,
                message: '获取二维码图片失败',
                error: error.message,
            });
        }
    }
    async checkQrStatus() {
        return await this.weMpRssService.checkQrStatus();
    }
    async searchAccount(keyword) {
        return await this.weMpRssService.searchAccount(keyword);
    }
    async addSubscription(body) {
        return await this.weMpRssService.addSubscription(body);
    }
    async getSubscriptions() {
        return await this.weMpRssService.getSubscriptions();
    }
    async deleteSubscription(id) {
        const result = await this.weMpRssService.deleteSubscription(id);
        try {
            await this.wechatMonitorService.deleteArticlesByAccountId(id);
            this.logger.log(`已删除公众号 ${id} 的所有文章`);
        }
        catch (error) {
            this.logger.error(`删除公众号文章失败: ${error.message}`);
        }
        return result;
    }
    async triggerUpdate(id, pages = 10) {
        this.logger.log(`手动触发更新公众号: ${id}, 爬取页数: ${pages}`);
        return await this.weMpRssService.updateMpArticles(id, 0, pages);
    }
    async getArticles(accountId, page = 1, pageSize = 20) {
        return await this.weMpRssService.getArticles(accountId, page, pageSize);
    }
    async getArticleDetail(id) {
        return await this.weMpRssService.getArticleDetail(id);
    }
    async checkHealth() {
        return await this.weMpRssService.checkHealth();
    }
    async importHistoryArticles(body) {
        this.logger.log('开始导入历史文章');
        return await this.wechatMonitorService.importHistoryArticles(body.mpId, body.limit);
    }
    async syncArticles() {
        this.logger.log('开始同步文章');
        return await this.wechatMonitorService.syncArticles();
    }
    async imageProxy(imageUrl, res) {
        try {
            if (!imageUrl) {
                return res.status(400).json({
                    code: -1,
                    message: '缺少图片URL参数',
                });
            }
            this.logger.log(`代理图片请求: ${imageUrl}`);
            const response = await axios_1.default.get(imageUrl, {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Referer': 'https://mp.weixin.qq.com/',
                },
                timeout: 10000,
            });
            const contentType = response.headers['content-type'] || 'image/png';
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=86400');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.send(Buffer.from(response.data));
        }
        catch (error) {
            this.logger.error(`代理图片失败: ${error.message}`);
            res.status(500).json({
                code: -1,
                message: '获取图片失败',
                error: error.message,
            });
        }
    }
};
exports.WechatMonitorController = WechatMonitorController;
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WechatMonitorController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('qr-code'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WechatMonitorController.prototype, "getQrCode", null);
__decorate([
    (0, common_1.Get)('qr-image'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WechatMonitorController.prototype, "getQrImage", null);
__decorate([
    (0, common_1.Get)('qr-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WechatMonitorController.prototype, "checkQrStatus", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('keyword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WechatMonitorController.prototype, "searchAccount", null);
__decorate([
    (0, common_1.Post)('subscriptions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WechatMonitorController.prototype, "addSubscription", null);
__decorate([
    (0, common_1.Get)('subscriptions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WechatMonitorController.prototype, "getSubscriptions", null);
__decorate([
    (0, common_1.Delete)('subscriptions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WechatMonitorController.prototype, "deleteSubscription", null);
__decorate([
    (0, common_1.Post)('subscriptions/:id/update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('pages')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], WechatMonitorController.prototype, "triggerUpdate", null);
__decorate([
    (0, common_1.Get)('articles'),
    __param(0, (0, common_1.Query)('accountId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], WechatMonitorController.prototype, "getArticles", null);
__decorate([
    (0, common_1.Get)('articles/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WechatMonitorController.prototype, "getArticleDetail", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WechatMonitorController.prototype, "checkHealth", null);
__decorate([
    (0, common_1.Post)('import-history'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WechatMonitorController.prototype, "importHistoryArticles", null);
__decorate([
    (0, common_1.Post)('sync-articles'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WechatMonitorController.prototype, "syncArticles", null);
__decorate([
    (0, common_1.Get)('image-proxy'),
    __param(0, (0, common_1.Query)('url')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WechatMonitorController.prototype, "imageProxy", null);
exports.WechatMonitorController = WechatMonitorController = WechatMonitorController_1 = __decorate([
    (0, common_1.Controller)('wechat-monitor'),
    __metadata("design:paramtypes", [wechat_monitor_service_1.WechatMonitorService,
        we_mp_rss_service_1.WeMpRssService])
], WechatMonitorController);
//# sourceMappingURL=wechat-monitor.controller.js.map