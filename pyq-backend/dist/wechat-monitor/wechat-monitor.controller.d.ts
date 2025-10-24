import { Response } from 'express';
import { WechatMonitorService } from './wechat-monitor.service';
import { WeMpRssService } from './we-mp-rss.service';
export declare class WechatMonitorController {
    private readonly wechatMonitorService;
    private readonly weMpRssService;
    private readonly logger;
    constructor(wechatMonitorService: WechatMonitorService, weMpRssService: WeMpRssService);
    handleWebhook(articleData: any): Promise<{
        success: boolean;
        message: string;
        articleId: any;
    }>;
    getQrCode(): Promise<any>;
    getQrImage(res: Response): Promise<void>;
    checkQrStatus(): Promise<any>;
    searchAccount(keyword: string): Promise<any>;
    addSubscription(body: {
        mp_name: string;
        mp_id: string;
        mp_cover?: string;
        avatar?: string;
        mp_intro?: string;
    }): Promise<any>;
    getSubscriptions(): Promise<any>;
    deleteSubscription(id: string): Promise<any>;
    triggerUpdate(id: string, pages?: number): Promise<any>;
    getArticles(accountId: string, page?: number, pageSize?: number): Promise<any>;
    getArticleDetail(id: string): Promise<any>;
    checkHealth(): Promise<{
        status: string;
        data: any;
        message?: undefined;
    } | {
        status: string;
        message: any;
        data?: undefined;
    }>;
    importHistoryArticles(body: {
        mpId?: string;
        limit?: number;
    }): Promise<{
        success: boolean;
        message: string;
        totalImported: number;
    }>;
    syncArticles(): Promise<{
        success: boolean;
        message: string;
        synced: number;
    }>;
    imageProxy(imageUrl: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
