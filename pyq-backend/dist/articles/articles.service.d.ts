import { SupabaseService } from '../common/supabase.service';
export declare class ArticlesService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    getArticles(page?: number, pageSize?: number, accountId?: string, status?: string): Promise<{
        data: any[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    getArticleById(id: string): Promise<any>;
    createArticle(articleData: any): Promise<any>;
    updateArticleStatus(id: string, status: string, rewrittenContent?: string): Promise<any>;
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
    findByUrl(url: string): Promise<any>;
    deleteArticlesByAccountId(accountId: string): Promise<{
        success: boolean;
        deleted: number;
    }>;
}
