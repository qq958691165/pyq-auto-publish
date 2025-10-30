import { PublishService } from './publish.service';
export declare class PublishController {
    private readonly publishService;
    constructor(publishService: PublishService);
    createTask(body: any, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getTasks(query: any, req: any): Promise<{
        success: boolean;
        data: {
            tasks: any[];
            total: number;
            page: number;
            pageSize: number;
        };
    }>;
    getPendingTasks(): Promise<{
        success: boolean;
        data: any[];
    }>;
}
