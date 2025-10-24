import { ConfigService } from './config.service';
import { SchedulerService } from '../scheduler/scheduler.service';
export declare class ConfigController {
    private readonly configService;
    private readonly schedulerService;
    constructor(configService: ConfigService, schedulerService: SchedulerService);
    getAllConfigs(): Promise<{
        success: boolean;
        data: any[];
    }>;
    getSyncInterval(): Promise<{
        success: boolean;
        data: {
            interval_minutes: number;
        };
    }>;
    setSyncInterval(body: {
        interval_minutes: number;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
