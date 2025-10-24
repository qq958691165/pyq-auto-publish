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
var WeMpRssService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeMpRssService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let WeMpRssService = WeMpRssService_1 = class WeMpRssService {
    constructor() {
        this.logger = new common_1.Logger(WeMpRssService_1.name);
        this.accessToken = '';
        this.weMpRssUrl = process.env.WE_MP_RSS_URL || 'http://localhost:8001';
        this.username = process.env.WE_MP_RSS_USERNAME || 'admin';
        this.password = process.env.WE_MP_RSS_PASSWORD || 'admin@123';
        this.axiosInstance = axios_1.default.create({
            baseURL: this.weMpRssUrl,
            withCredentials: true,
        });
    }
    async login() {
        try {
            const params = new URLSearchParams();
            params.append('username', this.username);
            params.append('password', this.password);
            const response = await this.axiosInstance.post('/api/v1/wx/auth/login', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            if (response.data && response.data.code === 0 && response.data.data) {
                this.accessToken = response.data.data.access_token;
                this.logger.log(`we-mp-rss登录成功,获取到access token: ${this.accessToken.substring(0, 20)}...`);
            }
            else {
                this.logger.error(`we-mp-rss登录失败: ${JSON.stringify(response.data)}`);
                throw new Error('登录失败,未获取到access_token');
            }
            return this.accessToken;
        }
        catch (error) {
            this.logger.error(`we-mp-rss登录失败: ${error.message}`);
            throw error;
        }
    }
    async ensureLoggedIn() {
        if (!this.accessToken) {
            await this.login();
        }
    }
    async getHeaders() {
        await this.ensureLoggedIn();
        return {
            'Authorization': `Bearer ${this.accessToken}`,
        };
    }
    async getQrCode() {
        try {
            const headers = await this.getHeaders();
            const response = await this.axiosInstance.get('/api/v1/wx/auth/qr/code', {
                headers,
            });
            return response.data;
        }
        catch (error) {
            this.logger.error(`获取二维码失败: ${error.message}`);
            throw error;
        }
    }
    async getQrImage() {
        try {
            const headers = await this.getHeaders();
            const response = await this.axiosInstance.get('/api/v1/wx/auth/qr/image', {
                headers,
                responseType: 'arraybuffer',
            });
            return response.data;
        }
        catch (error) {
            this.logger.error(`获取二维码图片失败: ${error.message}`);
            throw error;
        }
    }
    async checkQrStatus() {
        try {
            const headers = await this.getHeaders();
            const response = await this.axiosInstance.get('/api/v1/wx/auth/qr/status', {
                headers,
            });
            return response.data;
        }
        catch (error) {
            this.logger.error(`检查二维码状态失败: ${error.message}`);
            throw error;
        }
    }
    async searchAccount(keyword) {
        try {
            const headers = await this.getHeaders();
            const response = await this.axiosInstance.get(`/api/v1/wx/mps/search/${encodeURIComponent(keyword)}`, {
                headers,
            });
            this.logger.log(`搜索公众号成功: ${keyword}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`搜索公众号失败: ${error.message}`);
            throw error;
        }
    }
    async addSubscription(mpData) {
        try {
            const headers = await this.getHeaders();
            const response = await this.axiosInstance.post('/api/v1/wx/mps', mpData, {
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                },
            });
            this.logger.log(`成功添加公众号订阅: ${mpData.mp_name}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`添加公众号订阅失败: ${error.message}`);
            throw error;
        }
    }
    async getSubscriptions() {
        try {
            const headers = await this.getHeaders();
            const response = await this.axiosInstance.get('/api/v1/wx/mps', {
                headers,
            });
            return response.data;
        }
        catch (error) {
            this.logger.error(`获取订阅列表失败: ${error.message}`);
            throw error;
        }
    }
    async deleteSubscription(mpId) {
        try {
            const headers = await this.getHeaders();
            const response = await this.axiosInstance.delete(`/api/v1/wx/mps/${mpId}`, {
                headers,
            });
            this.logger.log(`成功删除公众号订阅: ${mpId}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`删除公众号订阅失败: ${error.message}`);
            throw error;
        }
    }
    async triggerUpdate(mpId) {
        try {
            const headers = await this.getHeaders();
            const response = await this.axiosInstance.get(`/api/v1/wx/mps/update/${mpId}`, {
                headers,
            });
            this.logger.log(`成功触发更新: ${mpId}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`触发更新失败: ${error.message}`);
            throw error;
        }
    }
    async getArticles(mpId, page = 0, pageSize = 10) {
        try {
            const headers = await this.getHeaders();
            const offset = page * pageSize;
            const params = {
                offset: offset,
                limit: pageSize,
            };
            if (mpId) {
                params.mp_id = mpId;
            }
            this.logger.log(`调用getArticles - mpId: ${mpId}, page: ${page}, pageSize: ${pageSize}`);
            this.logger.log(`请求参数: ${JSON.stringify(params)}`);
            const response = await this.axiosInstance.get('/api/v1/wx/articles', {
                params,
                headers,
            });
            this.logger.log(`获取文章成功,返回 ${response.data?.data?.list?.length || 0} 篇文章,总数: ${response.data?.data?.total || 0}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`获取文章列表失败: ${error.message}`);
            this.logger.error(`错误详情: ${JSON.stringify(error.response?.data || {})}`);
            throw error;
        }
    }
    async getArticleDetail(articleId) {
        try {
            const headers = await this.getHeaders();
            const response = await this.axiosInstance.get(`/api/v1/wx/articles/${articleId}`, {
                headers,
            });
            return response.data;
        }
        catch (error) {
            this.logger.error(`获取文章详情失败: ${error.message}`);
            throw error;
        }
    }
    async checkHealth() {
        try {
            const response = await axios_1.default.get(`${this.weMpRssUrl}/api/v1/wx/sys/base_info`);
            return { status: 'ok', data: response.data };
        }
        catch (error) {
            this.logger.error(`we-mp-rss服务不可用: ${error.message}`);
            return { status: 'error', message: error.message };
        }
    }
    async updateMpArticles(mpId, startPage = 0, endPage = 10) {
        try {
            await this.ensureLoggedIn();
            this.logger.log(`开始手动更新公众号文章: ${mpId}, 页数: ${startPage}-${endPage}`);
            const response = await this.axiosInstance.get(`/api/v1/wx/mps/update/${mpId}`, {
                params: {
                    start_page: startPage,
                    end_page: endPage,
                },
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            });
            this.logger.log(`成功触发公众号文章更新: ${mpId}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`更新公众号文章失败: ${error.message}`);
            throw error;
        }
    }
};
exports.WeMpRssService = WeMpRssService;
exports.WeMpRssService = WeMpRssService = WeMpRssService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], WeMpRssService);
//# sourceMappingURL=we-mp-rss.service.js.map