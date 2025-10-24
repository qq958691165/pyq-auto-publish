import { Injectable, Logger } from '@nestjs/common';
import { WeMpRssService } from './we-mp-rss.service';
import { ArticlesService } from '../articles/articles.service';
import axios from 'axios';

/**
 * 微信公众号监控服务
 * 负责处理we-mp-rss推送的文章数据
 */
@Injectable()
export class WechatMonitorService {
  private readonly logger = new Logger(WechatMonitorService.name);

  constructor(
    private readonly weMpRssService: WeMpRssService,
    private readonly articlesService: ArticlesService,
  ) {}

  /**
   * 处理we-mp-rss推送的文章数据
   * @param articleData we-mp-rss推送的文章数据
   */
  async handleArticleWebhook(articleData: any) {
    try {
      this.logger.log(`收到新文章推送: ${articleData.title}`);

      // 1. 提取文章数据
      const images = this.extractImages(articleData.content);

      const article = {
        title: articleData.title,
        content: articleData.content, // HTML格式
        images: images, // 从HTML中提取图片URL
        publish_time: articleData.publish_time,
        author: articleData.author,
        url: articleData.url,
        account_name: articleData.account_name || '未知公众号',
        account_id: articleData.account_id,
      };

      // 2. 保存到数据库
      const savedArticle = await this.articlesService.createArticle(article);
      this.logger.log(`文章已保存到数据库: ${savedArticle.id}`);

      // 3. 异步处理后续流程(不阻塞Webhook响应)
      this.processArticleAsync(savedArticle.id, article).catch((error) => {
        this.logger.error(`文章异步处理失败: ${error.message}`);
      });

      return {
        success: true,
        message: '文章接收成功',
        articleId: savedArticle.id,
      };
    } catch (error) {
      this.logger.error(`文章处理失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 异步处理文章(改写、发布等)
   * @param articleId 文章ID
   * @param article 文章数据
   */
  private async processArticleAsync(articleId: string, article: any) {
    try {
      // 更新状态为"改写中"
      await this.articlesService.updateArticleStatus(articleId, '改写中');

      // 1. 触发Coze工作流改写文案
      const rewrittenContent = await this.triggerCozeWorkflow(article);

      // 更新状态为"已改写"
      await this.articlesService.updateArticleStatus(
        articleId,
        '已改写',
        rewrittenContent,
      );

      // 2. 下载图片到本地
      const localImages = await this.downloadImages(article.images);

      // 更新状态为"发布中"
      await this.articlesService.updateArticleStatus(articleId, '发布中');

      // 3. 调用Puppeteer自动化堆雪球
      await this.publishToDuixueqiu({
        content: rewrittenContent,
        images: localImages,
      });

      // 更新状态为"已发布"
      await this.articlesService.updateArticleStatus(articleId, '已发布');

      this.logger.log(`文章处理完成: ${article.title}`);
    } catch (error) {
      // 更新状态为"失败"
      await this.articlesService.updateArticleStatus(articleId, '失败');
      this.logger.error(`文章处理失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 从HTML内容中提取图片URL
   * @param htmlContent HTML内容
   */
  private extractImages(htmlContent: string): string[] {
    const images: string[] = [];
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;

    while ((match = imgRegex.exec(htmlContent)) !== null) {
      images.push(match[1]);
    }

    return images;
  }

  /**
   * 保存文章到飞书多维表格
   * @param article 文章数据
   */
  private async saveToFeishu(article: any) {
    try {
      const feishuAppId = process.env.FEISHU_APP_ID;
      const feishuAppSecret = process.env.FEISHU_APP_SECRET;
      const feishuTableId = process.env.FEISHU_TABLE_ID;

      // 1. 获取飞书访问令牌
      const tokenResponse = await axios.post(
        'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
        {
          app_id: feishuAppId,
          app_secret: feishuAppSecret,
        },
      );

      const accessToken = tokenResponse.data.tenant_access_token;

      // 2. 添加记录到飞书多维表格
      await axios.post(
        `https://open.feishu.cn/open-apis/bitable/v1/apps/${feishuTableId}/tables/tblxxxxxx/records`,
        {
          fields: {
            '标题': article.title,
            '正文': article.content,
            '图片': article.images.join(','),
            '发布时间': article.publishTime,
            '作者': article.author,
            '原文链接': article.url,
            '状态': '待处理',
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`文章已保存到飞书: ${article.title}`);
    } catch (error) {
      this.logger.error(`保存到飞书失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 触发Coze工作流改写文案
   * @param article 文章数据
   */
  private async triggerCozeWorkflow(article: any): Promise<string> {
    try {
      const cozeApiKey = process.env.COZE_API_KEY;
      const cozeWorkflowId = process.env.COZE_WORKFLOW_ID;

      const response = await axios.post(
        `https://api.coze.cn/v1/workflow/run`,
        {
          workflow_id: cozeWorkflowId,
          parameters: {
            title: article.title,
            content: article.content,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${cozeApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const rewrittenContent = response.data.data.output;
      this.logger.log(`文案改写完成: ${article.title}`);
      return rewrittenContent;
    } catch (error) {
      this.logger.error(`Coze工作流调用失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 下载图片到本地
   * @param imageUrls 图片URL数组
   */
  private async downloadImages(imageUrls: string[]): Promise<string[]> {
    const localPaths: string[] = [];

    for (const url of imageUrls) {
      try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const fileName = `image_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        const filePath = `./uploads/${fileName}`;

        // 保存图片到本地
        const fs = require('fs');
        fs.writeFileSync(filePath, response.data);

        localPaths.push(filePath);
        this.logger.log(`图片下载成功: ${fileName}`);
      } catch (error) {
        this.logger.error(`图片下载失败: ${url}`);
      }
    }

    return localPaths;
  }

  /**
   * 调用Puppeteer自动化堆雪球
   * @param data 发布数据
   */
  private async publishToDuixueqiu(data: { content: string; images: string[] }) {
    try {
      // 调用Puppeteer服务
      const puppeteerServiceUrl = process.env.PUPPETEER_SERVICE_URL || 'http://localhost:3002';

      await axios.post(
        `${puppeteerServiceUrl}/api/publish`,
        {
          content: data.content,
          images: data.images,
        },
      );

      this.logger.log('堆雪球发布成功');
    } catch (error) {
      this.logger.error(`堆雪球发布失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 导入历史文章 - 方案一:一键导入所有历史文章
   * @param mpId 可选:只导入特定公众号的文章
   * @param limit 可选:限制导入数量
   */
  async importHistoryArticles(mpId?: string, limit?: number) {
    try {
      this.logger.log(`开始导入历史文章... mpId: ${mpId}, limit: ${limit}`);

      let page = 0;
      const pageSize = 20;
      let totalImported = 0;
      let hasMore = true;

      while (hasMore && (!limit || totalImported < limit)) {
        this.logger.log(`正在获取第 ${page + 1} 页文章...`);

        // 从we-mp-rss获取文章列表
        const response = await this.weMpRssService.getArticles(mpId, page, pageSize);

        this.logger.log(`获取到响应: ${JSON.stringify(response).substring(0, 200)}...`);

        // we-mp-rss返回格式: { code: 0, message: "success", data: { list: [...], total: 57 } }
        // response已经是完整的响应对象,所以直接访问response.data.list
        if (!response.data || !response.data.list || response.data.list.length === 0) {
          this.logger.log(`没有更多文章了,退出循环`);
          hasMore = false;
          break;
        }

        const articles = response.data.list;  // 修复: 数据在response.data.list中
        this.logger.log(`本页获取到 ${articles.length} 篇文章`);

        // 批量导入文章
        for (const article of articles) {
          if (limit && totalImported >= limit) {
            hasMore = false;
            break;
          }

          try {
            // 检查文章是否已存在(通过URL去重)
            const existingArticle = await this.articlesService.findByUrl(article.url);

            if (existingArticle) {
              this.logger.log(`文章已存在,跳过: ${article.title}`);
              continue;
            }

            // 获取文章完整正文
            let fullContent = article.content || '';
            try {
              this.logger.log(`正在获取文章完整正文: ${article.title}`);
              const detailResponse = await this.weMpRssService.getArticleDetail(article.id);
              if (detailResponse?.data?.content) {
                fullContent = detailResponse.data.content;
                this.logger.log(`成功获取完整正文,长度: ${fullContent.length} 字符`);
              }
            } catch (detailError) {
              this.logger.warn(`获取文章详情失败,使用摘要: ${detailError.message}`);
            }

            // 提取图片
            const images = this.extractImages(fullContent);

            // 转换Unix时间戳(秒)为ISO日期字符串
            // article.publish_time是Unix时间戳(秒),需要转换为ISO格式
            const publishDate = new Date(article.publish_time * 1000).toISOString();

            // 保存文章到数据库
            await this.articlesService.createArticle({
              title: article.title,
              content: fullContent,  // 使用完整正文
              images: images,
              publish_time: publishDate,  // 使用转换后的ISO格式日期
              author: article.author,
              url: article.url,
              account_name: article.mp_name || '未知公众号',
              account_id: article.mp_id,
            });

            totalImported++;
            this.logger.log(`导入文章成功 (${totalImported}): ${article.title}`);
          } catch (error) {
            this.logger.error(`导入文章失败: ${article.title}, ${error.message}`);
          }
        }

        page++;
      }

      this.logger.log(`历史文章导入完成,共导入 ${totalImported} 篇文章`);

      return {
        success: true,
        message: `成功导入 ${totalImported} 篇历史文章`,
        totalImported,
      };
    } catch (error) {
      this.logger.error(`导入历史文章失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 定时同步文章 - 方案三:定时自动同步
   */
  async syncArticles() {
    try {
      this.logger.log('开始同步文章...');

      // 获取最新的20篇文章
      const response = await this.weMpRssService.getArticles(undefined, 0, 20);

      if (!response.data || !response.data.data) {
        return {
          success: true,
          message: '没有新文章需要同步',
          synced: 0,
        };
      }

      const articles = response.data.data;
      let synced = 0;

      for (const article of articles) {
        try {
          // 检查文章是否已存在
          const existingArticle = await this.articlesService.findByUrl(article.url);

          if (existingArticle) {
            continue; // 已存在,跳过
          }

          // 提取图片
          const images = this.extractImages(article.content);

          // 保存新文章
          await this.articlesService.createArticle({
            title: article.title,
            content: article.content,
            images: images,
            publish_time: article.publish_time,
            author: article.author,
            url: article.url,
            account_name: article.mp_name || '未知公众号',
            account_id: article.mp_id,
          });

          synced++;
          this.logger.log(`同步新文章: ${article.title}`);
        } catch (error) {
          this.logger.error(`同步文章失败: ${article.title}, ${error.message}`);
        }
      }

      this.logger.log(`文章同步完成,共同步 ${synced} 篇新文章`);

      return {
        success: true,
        message: `成功同步 ${synced} 篇新文章`,
        synced,
      };
    } catch (error) {
      this.logger.error(`同步文章失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 删除指定公众号的所有文章
   * @param accountId 公众号ID
   */
  async deleteArticlesByAccountId(accountId: string) {
    try {
      this.logger.log(`开始删除公众号 ${accountId} 的所有文章`);
      const result = await this.articlesService.deleteArticlesByAccountId(accountId);
      this.logger.log(`成功删除公众号 ${accountId} 的所有文章`);
      return result;
    } catch (error) {
      this.logger.error(`删除公众号文章失败: ${error.message}`);
      throw error;
    }
  }
}

