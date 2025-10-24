import { CozeService } from './coze.service';
export declare class CozeController {
    private readonly cozeService;
    constructor(cozeService: CozeService);
    rewrite(body: {
        content: string;
        images?: string[];
        articleId?: string;
    }, req: any): Promise<{
        success: boolean;
        data: {
            version1: string;
            version2: string;
            version3: string;
            historyId: any;
        };
        message: string;
    }>;
    getHistory(page: string, pageSize: string, req: any): Promise<any>;
}
