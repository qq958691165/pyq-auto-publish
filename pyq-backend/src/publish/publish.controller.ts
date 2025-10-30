import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PublishService } from './publish.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/publish')
@UseGuards(JwtAuthGuard)
export class PublishController {
  constructor(private readonly publishService: PublishService) {}

  /**
   * 创建发布任务
   */
  @Post('create')
  async createTask(@Body() body: any, @Request() req) {
    try {
      const userId = req.user.userId;

      const task = await this.publishService.createTask({
        userId,
        rewriteId: body.rewriteId,
        taskTitle: body.taskTitle,
        content: body.content,
        images: body.images,
        wechatAccount: body.wechatAccount,
        publishTime: new Date(body.publishTime),
        isImmediate: body.isImmediate,
        randomDelayMinutes: body.randomDelayMinutes,
      });

      return {
        success: true,
        data: task,
        message: '发布任务创建成功',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '创建发布任务失败',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取用户的发布任务列表
   */
  @Get('tasks')
  async getTasks(@Query() query: any, @Request() req) {
    try {
      const userId = req.user.userId;
      const page = parseInt(query.page) || 1;
      const pageSize = parseInt(query.pageSize) || 20;

      const result = await this.publishService.getUserTasks(
        userId,
        page,
        pageSize,
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '获取任务列表失败',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取待发布的任务(仅用于测试)
   */
  @Get('pending')
  async getPendingTasks() {
    try {
      const tasks = await this.publishService.getPendingTasks();

      return {
        success: true,
        data: tasks,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '获取待发布任务失败',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

