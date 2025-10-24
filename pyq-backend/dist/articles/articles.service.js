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
var ArticlesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticlesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../common/supabase.service");
let ArticlesService = ArticlesService_1 = class ArticlesService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.logger = new common_1.Logger(ArticlesService_1.name);
    }
    async getArticles(page = 1, pageSize = 20, accountId, status) {
        try {
            const supabase = this.supabaseService.getClient();
            let query = supabase
                .from('wechat_articles')
                .select('*', { count: 'exact' })
                .order('publish_time', { ascending: false });
            if (accountId) {
                query = query.eq('account_id', accountId);
            }
            if (status) {
                query = query.eq('status', status);
            }
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);
            const { data, error, count } = await query;
            if (error) {
                this.logger.error(`获取文章列表失败: ${error.message}`);
                throw error;
            }
            return {
                data,
                total: count,
                page,
                pageSize,
                totalPages: Math.ceil(count / pageSize),
            };
        }
        catch (error) {
            this.logger.error(`获取文章列表失败: ${error.message}`);
            throw error;
        }
    }
    async getArticleById(id) {
        try {
            const supabase = this.supabaseService.getClient();
            const { data, error } = await supabase
                .from('wechat_articles')
                .select('*')
                .eq('id', id)
                .single();
            if (error) {
                this.logger.error(`获取文章详情失败: ${error.message}`);
                throw error;
            }
            return data;
        }
        catch (error) {
            this.logger.error(`获取文章详情失败: ${error.message}`);
            throw error;
        }
    }
    async createArticle(articleData) {
        try {
            const supabase = this.supabaseService.getClient();
            const { data, error } = await supabase
                .from('wechat_articles')
                .insert([
                {
                    title: articleData.title,
                    content: articleData.content,
                    images: articleData.images || [],
                    publish_time: articleData.publish_time,
                    author: articleData.author,
                    url: articleData.url,
                    account_name: articleData.account_name,
                    account_id: articleData.account_id,
                    status: '待处理',
                },
            ])
                .select()
                .single();
            if (error) {
                this.logger.error(`创建文章失败: ${error.message}`);
                throw error;
            }
            this.logger.log(`文章创建成功: ${data.title}`);
            return data;
        }
        catch (error) {
            this.logger.error(`创建文章失败: ${error.message}`);
            throw error;
        }
    }
    async updateArticleStatus(id, status, rewrittenContent) {
        try {
            const supabase = this.supabaseService.getClient();
            const updateData = { status };
            if (rewrittenContent) {
                updateData.rewritten_content = rewrittenContent;
            }
            const { data, error } = await supabase
                .from('wechat_articles')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            if (error) {
                this.logger.error(`更新文章状态失败: ${error.message}`);
                throw error;
            }
            this.logger.log(`文章状态更新成功: ${id} -> ${status}`);
            return data;
        }
        catch (error) {
            this.logger.error(`更新文章状态失败: ${error.message}`);
            throw error;
        }
    }
    async deleteArticle(id) {
        try {
            const supabase = this.supabaseService.getClient();
            const { error } = await supabase
                .from('wechat_articles')
                .delete()
                .eq('id', id);
            if (error) {
                this.logger.error(`删除文章失败: ${error.message}`);
                throw error;
            }
            this.logger.log(`文章删除成功: ${id}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`删除文章失败: ${error.message}`);
            throw error;
        }
    }
    async getAccounts() {
        try {
            const supabase = this.supabaseService.getClient();
            const { data, error } = await supabase
                .from('wechat_articles')
                .select('account_id, account_name')
                .order('account_name');
            if (error) {
                this.logger.error(`获取公众号列表失败: ${error.message}`);
                throw error;
            }
            const uniqueAccounts = Array.from(new Map(data.map((item) => [item.account_id, item])).values());
            return uniqueAccounts;
        }
        catch (error) {
            this.logger.error(`获取公众号列表失败: ${error.message}`);
            throw error;
        }
    }
    async getStatistics() {
        try {
            const supabase = this.supabaseService.getClient();
            const { count: totalCount } = await supabase
                .from('wechat_articles')
                .select('*', { count: 'exact', head: true });
            const { count: pendingCount } = await supabase
                .from('wechat_articles')
                .select('*', { count: 'exact', head: true })
                .eq('status', '待处理');
            const { count: publishedCount } = await supabase
                .from('wechat_articles')
                .select('*', { count: 'exact', head: true })
                .eq('status', '已发布');
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const { count: todayCount } = await supabase
                .from('wechat_articles')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', today.toISOString());
            return {
                total: totalCount || 0,
                pending: pendingCount || 0,
                published: publishedCount || 0,
                today: todayCount || 0,
            };
        }
        catch (error) {
            this.logger.error(`获取统计信息失败: ${error.message}`);
            throw error;
        }
    }
    async findByUrl(url) {
        try {
            const supabase = this.supabaseService.getClient();
            const { data, error } = await supabase
                .from('wechat_articles')
                .select('*')
                .eq('url', url)
                .maybeSingle();
            if (error) {
                this.logger.error(`查找文章失败: ${error.message}`);
                throw error;
            }
            return data;
        }
        catch (error) {
            this.logger.error(`查找文章失败: ${error.message}`);
            throw error;
        }
    }
    async deleteArticlesByAccountId(accountId) {
        try {
            const supabase = this.supabaseService.getClient();
            const { error, count } = await supabase
                .from('wechat_articles')
                .delete({ count: 'exact' })
                .eq('account_id', accountId);
            if (error) {
                this.logger.error(`删除文章失败: ${error.message}`);
                throw error;
            }
            this.logger.log(`成功删除 ${count} 篇文章`);
            return { success: true, deleted: count };
        }
        catch (error) {
            this.logger.error(`删除文章失败: ${error.message}`);
            throw error;
        }
    }
};
exports.ArticlesService = ArticlesService;
exports.ArticlesService = ArticlesService = ArticlesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ArticlesService);
//# sourceMappingURL=articles.service.js.map