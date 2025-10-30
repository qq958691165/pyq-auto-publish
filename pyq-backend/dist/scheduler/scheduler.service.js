"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const wechat_monitor_service_1 = require("../wechat-monitor/wechat-monitor.service");
const config_service_1 = require("../config/config.service");
const publish_service_1 = require("../publish/publish.service");
const puppeteer_service_1 = require("../puppeteer/puppeteer.service");
let SchedulerService = SchedulerService_1 = class SchedulerService {
    constructor(wechatMonitorService, configService, schedulerRegistry, publishService, puppeteerService) {
        this.wechatMonitorService = wechatMonitorService;
        this.configService = configService;
        this.schedulerRegistry = schedulerRegistry;
        this.publishService = publishService;
        this.puppeteerService = puppeteerService;
        this.logger = new common_1.Logger(SchedulerService_1.name);
        this.syncIntervalHandle = null;
        this.isProcessingPublish = false;
        this.initializeSyncTask();
    }
    async initializeSyncTask() {
        try {
            const intervalMinutes = await this.configService.getSyncInterval();
            this.logger.log(`初始化同步任务,间隔: ${intervalMinutes} 分钟`);
            await this.restartSyncTask(intervalMinutes);
        }
        catch (error) {
            this.logger.error(`初始化同步任务失败: ${error.message}`);
        }
    }
    async restartSyncTask(intervalMinutes) {
        if (this.syncIntervalHandle) {
            clearInterval(this.syncIntervalHandle);
            this.logger.log('已清除旧的同步任务');
        }
        const intervalMs = intervalMinutes * 60 * 1000;
        this.syncIntervalHandle = setInterval(async () => {
            await this.executeSync();
        }, intervalMs);
        this.logger.log(`新的同步任务已启动,间隔: ${intervalMinutes} 分钟`);
        await this.executeSync();
    }
    async executeSync() {
        this.logger.log('开始执行定时同步任务...');
        try {
            const result = await this.wechatMonitorService.syncArticles();
            this.logger.log(`定时同步完成: ${result.message}`);
        }
        catch (error) {
            this.logger.error(`定时同步失败: ${error.message}`);
        }
    }
    async triggerSync() {
        this.logger.log('手动触发同步任务...');
        await this.executeSync();
    }
    async updateSyncInterval(intervalMinutes) {
        this.logger.log(`更新同步间隔为: ${intervalMinutes} 分钟`);
        await this.restartSyncTask(intervalMinutes);
    }
    async checkPendingTasks() {
        if (this.isProcessingPublish) {
            this.logger.log('上一个发布任务还在处理中,跳过本次检查');
            return;
        }
        try {
            this.isProcessingPublish = true;
            this.logger.log('开始检查待发布任务...');
            const pendingTasks = await this.publishService.getPendingTasks();
            if (pendingTasks.length === 0) {
                this.logger.log('没有待发布的任务');
                return;
            }
            this.logger.log(`发现 ${pendingTasks.length} 个待发布任务`);
            for (const task of pendingTasks) {
                try {
                    this.logger.log(`开始处理任务: ${task.id}`);
                    await this.puppeteerService.publishToDuixueqiu(task);
                    this.logger.log(`任务处理成功: ${task.id}`);
                }
                catch (error) {
                    this.logger.error(`任务处理失败: ${task.id}`, error);
                }
            }
            this.logger.log('所有待发布任务处理完成');
        }
        catch (error) {
            this.logger.error('检查待发布任务失败:', error);
        }
        finally {
            this.isProcessingPublish = false;
        }
    }
};
exports.SchedulerService = SchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "checkPendingTasks", null);
exports.SchedulerService = SchedulerService = SchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [wechat_monitor_service_1.WechatMonitorService,
        config_service_1.ConfigService,
        schedule_1.SchedulerRegistry,
        publish_service_1.PublishService,
        puppeteer_service_1.PuppeteerService])
], SchedulerService);
//# sourceMappingURL=scheduler.service.js.map