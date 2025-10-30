import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class PublishService implements OnModuleInit {
    private configService;
    private readonly logger;
    private supabase;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private ensureTableExists;
    createTask(taskData: {
        userId: string;
        rewriteId?: string;
        taskTitle?: string;
        content: string;
        images?: string[];
        wechatAccount?: string;
        publishTime: Date;
        isImmediate?: boolean;
        randomDelayMinutes?: number;
    }): Promise<any>;
    getPendingTasks(): Promise<any[]>;
    updateTaskStatus(taskId: string, status: string, errorMessage?: string, duixueqiuTaskId?: string): Promise<any>;
    getUserTasks(userId: string, page?: number, pageSize?: number): Promise<{
        tasks: any[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    downloadImages(imageUrls: string[]): Promise<string[]>;
    cleanupTempImages(imagePaths: string[]): void;
}
