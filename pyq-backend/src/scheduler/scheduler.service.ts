import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry, Cron, CronExpression } from '@nestjs/schedule';
import { WechatMonitorService } from '../wechat-monitor/wechat-monitor.service';
import { ConfigService } from '../config/config.service';
import { PublishService } from '../publish/publish.service';
import { PuppeteerService } from '../puppeteer/puppeteer.service';

/**
 * 定时任务服务
 * 负责定时同步文章等自动化任务
 * 支持动态调整同步间隔
 */
@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private syncIntervalHandle: NodeJS.Timeout | null = null;
  private isProcessingPublish = false;

  constructor(
    private readonly wechatMonitorService: WechatMonitorService,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly publishService: PublishService,
    private readonly puppeteerService: PuppeteerService,
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

  /**
   * 每分钟检查一次待发布的任务
   */
  @Cron(CronExpression.EVERY_MINUTE)
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

      // 逐个处理任务
      for (const task of pendingTasks) {
        try {
          this.logger.log(`开始处理任务: ${task.id}`);
          await this.puppeteerService.publishToDuixueqiu(task);
          this.logger.log(`任务处理成功: ${task.id}`);
        } catch (error) {
          this.logger.error(`任务处理失败: ${task.id}`, error);
          // 继续处理下一个任务
        }
      }

      this.logger.log('所有待发布任务处理完成');
    } catch (error) {
      this.logger.error('检查待发布任务失败:', error);
    } finally {
      this.isProcessingPublish = false;
    }
  }
}

