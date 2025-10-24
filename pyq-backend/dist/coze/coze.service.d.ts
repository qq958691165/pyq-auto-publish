import { ConfigService } from '@nestjs/config';
export declare class CozeService {
    private configService;
    private readonly logger;
    private readonly cozeApiKey;
    private readonly cozeBotId;
    private readonly cozeApiUrl;
    private readonly supabase;
    constructor(configService: ConfigService);
    rewriteContent(content: string, userId: string): Promise<string>;
    saveRewriteHistory(data: {
        userId: string;
        articleId?: string;
        originalContent: string;
        originalImages: string[];
        rewrittenContent: string;
        selectedImages: string[];
    }): Promise<any>;
    getRewriteHistory(userId: string, page?: number, pageSize?: number): Promise<any>;
}
