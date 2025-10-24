export declare class WeMpRssService {
    private readonly logger;
    private readonly weMpRssUrl;
    private readonly username;
    private readonly password;
    private axiosInstance;
    private accessToken;
    constructor();
    private login;
    private ensureLoggedIn;
    private getHeaders;
    getQrCode(): Promise<any>;
    getQrImage(): Promise<any>;
    checkQrStatus(): Promise<any>;
    searchAccount(keyword: string): Promise<any>;
    addSubscription(mpData: {
        mp_name: string;
        mp_id: string;
        mp_cover?: string;
        avatar?: string;
        mp_intro?: string;
    }): Promise<any>;
    getSubscriptions(): Promise<any>;
    deleteSubscription(mpId: string): Promise<any>;
    triggerUpdate(mpId: string): Promise<any>;
    getArticles(mpId?: string, page?: number, pageSize?: number): Promise<any>;
    getArticleDetail(articleId: string): Promise<any>;
    checkHealth(): Promise<{
        status: string;
        data: any;
        message?: undefined;
    } | {
        status: string;
        message: any;
        data?: undefined;
    }>;
    updateMpArticles(mpId: string, startPage?: number, endPage?: number): Promise<any>;
}
