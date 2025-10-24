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
var CozeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CozeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const supabase_js_1 = require("@supabase/supabase-js");
let CozeService = CozeService_1 = class CozeService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(CozeService_1.name);
        this.cozeApiUrl = 'https://api.coze.cn/v3/chat';
        this.cozeApiKey = 'sat_IypG3mLLmm4m1qaRx6qK4E0HpKN6z910uZlEuU9xzLKRja92fpeEVH4EcKsM0y9D';
        this.cozeBotId = '7564586994702762027';
        const supabaseUrl = this.configService.get('SUPABASE_URL');
        const supabaseKey = this.configService.get('SUPABASE_KEY');
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    }
    async rewriteContent(content, userId) {
        try {
            this.logger.log(`开始调用Coze AI转写文案,用户ID: ${userId}`);
            const createResponse = await axios_1.default.post(this.cozeApiUrl, {
                bot_id: this.cozeBotId,
                user_id: userId,
                stream: false,
                additional_messages: [
                    {
                        role: 'user',
                        content: content,
                        content_type: 'text',
                    },
                ],
            }, {
                headers: {
                    Authorization: `Bearer ${this.cozeApiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 60000,
            });
            this.logger.log('Coze API创建对话成功');
            const conversationId = createResponse.data?.data?.conversation_id;
            const chatId = createResponse.data?.data?.id;
            if (!conversationId || !chatId) {
                throw new Error('未能获取conversation_id或chat_id');
            }
            this.logger.log(`对话ID: ${conversationId}, Chat ID: ${chatId}, 开始轮询获取结果...`);
            const maxRetries = 30;
            const retryInterval = 2000;
            for (let i = 0; i < maxRetries; i++) {
                await new Promise((resolve) => setTimeout(resolve, retryInterval));
                const retrieveResponse = await axios_1.default.get(`https://api.coze.cn/v3/chat/retrieve?conversation_id=${conversationId}&chat_id=${chatId}`, {
                    headers: {
                        Authorization: `Bearer ${this.cozeApiKey}`,
                    },
                });
                const status = retrieveResponse.data?.data?.status;
                this.logger.log(`轮询第${i + 1}次, 状态: ${status}`);
                if (status === 'completed') {
                    const messagesResponse = await axios_1.default.get(`https://api.coze.cn/v3/chat/message/list?conversation_id=${conversationId}&chat_id=${chatId}`, {
                        headers: {
                            Authorization: `Bearer ${this.cozeApiKey}`,
                        },
                    });
                    const messages = messagesResponse.data?.data || [];
                    this.logger.log(`获取到${messages.length}条消息`);
                    const answerMessage = messages.find((msg) => msg.role === 'assistant' && msg.type === 'answer');
                    if (answerMessage && answerMessage.content) {
                        this.logger.log('成功获取转写结果');
                        return answerMessage.content;
                    }
                    throw new Error('未能从消息列表中找到转写结果');
                }
                else if (status === 'failed') {
                    const errorMsg = retrieveResponse.data?.data?.last_error?.msg || '未知错误';
                    throw new Error(`Coze AI转写失败: ${errorMsg}`);
                }
            }
            throw new Error('转写超时,请稍后重试');
        }
        catch (error) {
            this.logger.error('调用Coze API失败', error);
            if (axios_1.default.isAxiosError(error)) {
                throw new Error(`Coze API调用失败: ${error.response?.data?.msg || error.message}`);
            }
            throw error;
        }
    }
    async saveRewriteHistory(data) {
        try {
            const { data: result, error } = await this.supabase
                .from('rewrite_history')
                .insert({
                user_id: data.userId,
                article_id: data.articleId,
                original_content: data.originalContent,
                original_images: data.originalImages,
                rewritten_content: data.rewrittenContent,
                selected_images: data.selectedImages,
                coze_workflow_id: this.cozeBotId,
                status: 'completed',
            })
                .select()
                .single();
            if (error) {
                this.logger.error('保存转写历史失败', error);
                throw new Error(`保存转写历史失败: ${error.message}`);
            }
            this.logger.log(`转写历史保存成功,ID: ${result.id}`);
            return result;
        }
        catch (error) {
            this.logger.error('保存转写历史异常', error);
            throw error;
        }
    }
    async getRewriteHistory(userId, page = 1, pageSize = 20) {
        try {
            const offset = (page - 1) * pageSize;
            const { data, error, count } = await this.supabase
                .from('rewrite_history')
                .select('*', { count: 'exact' })
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range(offset, offset + pageSize - 1);
            if (error) {
                throw new Error(`获取转写历史失败: ${error.message}`);
            }
            return {
                data,
                total: count,
                page,
                pageSize,
            };
        }
        catch (error) {
            this.logger.error('获取转写历史失败', error);
            throw error;
        }
    }
};
exports.CozeService = CozeService;
exports.CozeService = CozeService = CozeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CozeService);
//# sourceMappingURL=coze.service.js.map