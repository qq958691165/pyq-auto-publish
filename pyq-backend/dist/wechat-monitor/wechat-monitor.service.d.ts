import { WeMpRssService } from './we-mp-rss.service';
import { ArticlesService } from '../articles/articles.service';
export declare class WechatMonitorService {
    private readonly weMpRssService;
    private readonly articlesService;
    private readonly logger;
    constructor(weMpRssService: WeMpRssService, articlesService: ArticlesService);
    handleArticleWebhook(articleData: any): Promise<{
        success: boolean;
        message: string;
        articleId: any;
    }>;
    private processArticleAsync;
    private extractImages;
    private saveToFeishu;
    private triggerCozeWorkflow;
    private downloadImages;
    private publishToDuixueqiu;
    importHistoryArticles(mpId?: string, limit?: number): Promise<{
        success: boolean;
        message: string;
        totalImported: number;
    }>;
    syncArticles(): Promise<{
        success: boolean;
        message: string;
        synced: number;
    }>;
    deleteArticlesByAccountId(accountId: string): Promise<{
        success: boolean;
        deleted: number;
    }>;
}
