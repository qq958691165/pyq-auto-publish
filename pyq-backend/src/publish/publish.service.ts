import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

@Injectable()
export class PublishService implements OnModuleInit {
  private readonly logger = new Logger(PublishService.name);
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async onModuleInit() {
    this.logger.log('🚀 初始化发布服务,检查数据库表...');
    await this.ensureTableExists();
  }

  /**
   * 确保publish_tasks表存在
   */
  private async ensureTableExists() {
    try {
      // 尝试查询表,如果表不存在会抛出错误
      const { error } = await this.supabase
        .from('publish_tasks')
        .select('id')
        .limit(1);

      if (error) {
        this.logger.warn('⚠️  publish_tasks表可能不存在');
        this.logger.warn('请在Supabase Dashboard中执行以下SQL:');
        this.logger.warn(`
CREATE TABLE IF NOT EXISTS publish_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  rewrite_id UUID,
  task_title VARCHAR(255),
  content TEXT NOT NULL,
  images TEXT[],
  wechat_account VARCHAR(100),
  publish_time TIMESTAMP NOT NULL,
  is_immediate BOOLEAN DEFAULT false,
  random_delay_minutes INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  duixueqiu_task_id VARCHAR(100),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_publish_tasks_status ON publish_tasks(status);
CREATE INDEX IF NOT EXISTS idx_publish_tasks_publish_time ON publish_tasks(publish_time);
CREATE INDEX IF NOT EXISTS idx_publish_tasks_user_id ON publish_tasks(user_id);
        `);
      } else {
        this.logger.log('✅ publish_tasks表已存在');
      }
    } catch (error) {
      this.logger.error('检查数据库表失败:', error.message);
    }
  }

  /**
   * 创建发布任务
   */
  async createTask(taskData: {
    userId: string;
    rewriteId?: string;
    taskTitle?: string;
    content: string;
    images?: string[];
    wechatAccount?: string;
    publishTime: Date;
    isImmediate?: boolean;
    randomDelayMinutes?: number;
  }) {
    try {
      const { data, error } = await this.supabase
        .from('publish_tasks')
        .insert([
          {
            user_id: taskData.userId,
            rewrite_id: taskData.rewriteId,
            task_title: taskData.taskTitle,
            content: taskData.content,
            images: taskData.images || [],
            wechat_account: taskData.wechatAccount,
            publish_time: taskData.publishTime.toISOString(),
            is_immediate: taskData.isImmediate || false,
            random_delay_minutes: taskData.randomDelayMinutes || 0,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) {
        this.logger.error('创建发布任务失败:', error);
        throw error;
      }

      this.logger.log(`发布任务创建成功: ${data.id}`);
      return data;
    } catch (error) {
      this.logger.error('创建发布任务异常:', error);
      throw error;
    }
  }

  /**
   * 获取待发布的任务
   */
  async getPendingTasks() {
    try {
      const now = new Date().toISOString();

      const { data, error } = await this.supabase
        .from('publish_tasks')
        .select('*')
        .eq('status', 'pending')
        .lte('publish_time', now)
        .order('publish_time', { ascending: true });

      if (error) {
        this.logger.error('获取待发布任务失败:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      this.logger.error('获取待发布任务异常:', error);
      throw error;
    }
  }

  /**
   * 更新任务状态
   */
  async updateTaskStatus(
    taskId: string,
    status: string,
    errorMessage?: string,
    duixueqiuTaskId?: string,
  ) {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (errorMessage) {
        updateData.error_message = errorMessage;
      }

      if (duixueqiuTaskId) {
        updateData.duixueqiu_task_id = duixueqiuTaskId;
      }

      const { data, error } = await this.supabase
        .from('publish_tasks')
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        this.logger.error('更新任务状态失败:', error);
        throw error;
      }

      return data;
    } catch (error) {
      this.logger.error('更新任务状态异常:', error);
      throw error;
    }
  }

  /**
   * 获取用户的发布任务列表
   */
  async getUserTasks(userId: string, page = 1, pageSize = 20) {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await this.supabase
        .from('publish_tasks')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        this.logger.error('获取用户任务列表失败:', error);
        throw error;
      }

      return {
        tasks: data || [],
        total: count || 0,
        page,
        pageSize,
      };
    } catch (error) {
      this.logger.error('获取用户任务列表异常:', error);
      throw error;
    }
  }

  /**
   * 下载图片到本地
   */
  async downloadImages(imageUrls: string[]): Promise<string[]> {
    const tempDir = path.join(__dirname, '../../temp_images');

    // 确保临时目录存在
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const localPaths: string[] = [];

    for (let i = 0; i < imageUrls.length; i++) {
      try {
        const imageUrl = imageUrls[i];
        const ext = path.extname(imageUrl).split('?')[0] || '.jpg';
        const filename = `image_${Date.now()}_${i}${ext}`;
        const savePath = path.join(tempDir, filename);

        this.logger.log(`下载图片: ${imageUrl} -> ${savePath}`);

        const response = await axios({
          url: imageUrl,
          method: 'GET',
          responseType: 'stream',
          timeout: 30000,
        });

        const writer = fs.createWriteStream(savePath);
        response.data.pipe(writer);

        await new Promise<void>((resolve, reject) => {
          writer.on('finish', () => resolve());
          writer.on('error', reject);
        });

        localPaths.push(savePath);
        this.logger.log(`图片下载成功: ${savePath}`);
      } catch (error) {
        this.logger.error(`下载图片失败: ${imageUrls[i]}`, error);
        throw error;
      }
    }

    return localPaths;
  }

  /**
   * 清理临时图片文件
   */
  cleanupTempImages(imagePaths: string[]) {
    for (const imagePath of imagePaths) {
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          this.logger.log(`清理临时文件: ${imagePath}`);
        }
      } catch (error) {
        this.logger.error(`清理临时文件失败: ${imagePath}`, error);
      }
    }
  }
}

