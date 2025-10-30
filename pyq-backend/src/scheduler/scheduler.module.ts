import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { WechatMonitorModule } from '../wechat-monitor/wechat-monitor.module';
import { ConfigModule } from '../config/config.module';
import { PublishModule } from '../publish/publish.module';
import { PuppeteerModule } from '../puppeteer/puppeteer.module';

/**
 * 定时任务模块
 */
@Module({
  imports: [
    ScheduleModule.forRoot(),
    WechatMonitorModule,
    ConfigModule,
    PublishModule,
    PuppeteerModule,
  ],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}

