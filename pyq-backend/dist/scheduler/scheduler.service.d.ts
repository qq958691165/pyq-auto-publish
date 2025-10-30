import { SchedulerRegistry } from '@nestjs/schedule';
import { WechatMonitorService } from '../wechat-monitor/wechat-monitor.service';
import { ConfigService } from '../config/config.service';
import { PublishService } from '../publish/publish.service';
import { PuppeteerService } from '../puppeteer/puppeteer.service';
export declare class SchedulerService {
    private readonly wechatMonitorService;
    private readonly configService;
    private readonly schedulerRegistry;
    private readonly publishService;
    private readonly puppeteerService;
    private readonly logger;
    private syncIntervalHandle;
    private isProcessingPublish;
    constructor(wechatMonitorService: WechatMonitorService, configService: ConfigService, schedulerRegistry: SchedulerRegistry, publishService: PublishService, puppeteerService: PuppeteerService);
    initializeSyncTask(): Promise<void>;
    restartSyncTask(intervalMinutes: number): Promise<void>;
    executeSync(): Promise<void>;
    triggerSync(): Promise<void>;
    updateSyncInterval(intervalMinutes: number): Promise<void>;
    checkPendingTasks(): Promise<void>;
}
