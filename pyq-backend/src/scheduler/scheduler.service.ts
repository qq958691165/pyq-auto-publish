import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { WechatMonitorService } from '../wechat-monitor/wechat-monitor.service';
import { ConfigService } from '../config/config.service';

/**
 * 定时任务服务
 * 负责定时同步文章等自动化任务
 * 支持动态调整同步间隔
 */
@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private syncIntervalHandle: NodeJS.Timeout | null = null;

  constructor(
    private readonly wechatMonitorService: WechatMonitorService,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    // 启动时初始化定时任务
    this.initializeSyncTask();
  }

  /**
   * 初始化同步任务
   */
  async initializeSyncTask() {
    try {
      const intervalMinutes = await this.configService.getSyncInterval();
      this.logger.log(`初始化同步任务,间隔: ${intervalMinutes} 分钟`);
      await this.restartSyncTask(intervalMinutes);
    } catch (error) {
      this.logger.error(`初始化同步任务失败: ${error.message}`);
    }
  }

  /**
   * 重启同步任务(使用新的间隔)
   */
  async restartSyncTask(intervalMinutes: number) {
    // 清除旧的定时任务
    if (this.syncIntervalHandle) {
      clearInterval(this.syncIntervalHandle);
      this.logger.log('已清除旧的同步任务');
    }

    // 创建新的定时任务
    const intervalMs = intervalMinutes * 60 * 1000;
    this.syncIntervalHandle = setInterval(async () => {
      await this.executeSync();
    }, intervalMs);

    this.logger.log(`新的同步任务已启动,间隔: ${intervalMinutes} 分钟`);

    // 立即执行一次同步
    await this.executeSync();
  }

  /**
   * 执行同步任务
   */
  async executeSync() {
    this.logger.log('开始执行定时同步任务...');

    try {
      const result = await this.wechatMonitorService.syncArticles();
      this.logger.log(`定时同步完成: ${result.message}`);
    } catch (error) {
      this.logger.error(`定时同步失败: ${error.message}`);
    }
  }

  /**
   * 手动触发同步
   */
  async triggerSync() {
    this.logger.log('手动触发同步任务...');
    await this.executeSync();
  }

  /**
   * 更新同步间隔
   */
  async updateSyncInterval(intervalMinutes: number) {
    this.logger.log(`更新同步间隔为: ${intervalMinutes} 分钟`);
    await this.restartSyncTask(intervalMinutes);
  }
}

