import * as puppeteer from 'puppeteer';
import { PublishService } from '../publish/publish.service';
import { DuixueqiuAccountsService } from '../duixueqiu-accounts/duixueqiu-accounts.service';
export declare class PuppeteerService {
    private readonly publishService;
    private readonly duixueqiuAccountsService;
    private readonly logger;
    constructor(publishService: PublishService, duixueqiuAccountsService: DuixueqiuAccountsService);
    private smartWait;
    private waitForDialogOpen;
    private waitForDialogClose;
    private waitForNavigation;
    loginToDuixueqiu(userId: string): Promise<{
        browser: puppeteer.Browser;
        page: puppeteer.Page;
    }>;
    publishToDuixueqiu(task: any): Promise<{
        success: boolean;
        taskId: any;
    }>;
    createFollowCircle(firstTaskTitle: string, followCircleData: {
        title: string;
        content: string;
        images?: string[];
        publishTime: Date;
    }, userId: string): Promise<void>;
    deleteCircleByTitleAndContent(deleteTitle: string, deleteContent: string, userId: string): Promise<boolean>;
    private loginDuixueqiu;
    private formatDateTime;
    publishFollowCircles(firstCircleData: {
        title: string;
        content: string;
        images: string[];
    }, followCircles: Array<{
        title: string;
        content: string;
        images: string[];
        publishTime: Date;
    }>, userId: string): Promise<void>;
    private publishCircleInPage;
    private createFollowCircleInPage;
    deleteCircleByTitle(taskTitle: string, userId: string): Promise<void>;
}
