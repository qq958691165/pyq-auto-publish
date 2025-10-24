import { SchedulerRegistry } from '@nestjs/schedule';
import { WechatMonitorService } from '../wechat-monitor/wechat-monitor.service';
import { ConfigService } from '../config/config.service';
export declare class SchedulerService {
    private readonly wechatMonitorService;
    private readonly configService;
    private readonly schedulerRegistry;
    private readonly logger;
    private syncIntervalHandle;
    constructor(wechatMonitorService: WechatMonitorService, configService: ConfigService, schedulerRegistry: SchedulerRegistry);
    initializeSyncTask(): Promise<void>;
    restartSyncTask(intervalMinutes: number): Promise<void>;
    executeSync(): Promise<void>;
    triggerSync(): Promise<void>;
    updateSyncInterval(intervalMinutes: number): Promise<void>;
}
