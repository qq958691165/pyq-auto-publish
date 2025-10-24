import { ArticlesService } from './articles.service';
export declare class ArticlesController {
    private readonly articlesService;
    constructor(articlesService: ArticlesService);
    getArticles(page?: string, pageSize?: string, accountId?: string, accountIdCamel?: string, status?: string): Promise<{
        data: any[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    getArticleById(id: string): Promise<{
        success: boolean;
        data: any;
    }>;
    deleteArticle(id: string): Promise<{
        success: boolean;
    }>;
    getAccounts(): Promise<{
        account_id: any;
        account_name: any;
    }[]>;
    getStatistics(): Promise<{
        total: number;
        pending: number;
        published: number;
        today: number;
    }>;
}
