import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

/**
 * we-mp-rss API服务
 * 负责与we-mp-rss系统进行交互
 */
@Injectable()
export class WeMpRssService {
  private readonly logger = new Logger(WeMpRssService.name);
  private readonly weMpRssUrl: string;
  private readonly username: string;
  private readonly password: string;
  private axiosInstance: AxiosInstance;
  private accessToken: string = '';

  constructor() {
    // we-mp-rss服务地址(默认本地部署)
    this.weMpRssUrl = process.env.WE_MP_RSS_URL || 'http://localhost:8001';
    // we-mp-rss登录凭证
    this.username = process.env.WE_MP_RSS_USERNAME || 'admin';
    this.password = process.env.WE_MP_RSS_PASSWORD || 'admin@123';

    // 创建axios实例,启用cookie支持
    this.axiosInstance = axios.create({
      baseURL: this.weMpRssUrl,
      withCredentials: true, // 启用cookie
    });
  }

  /**
   * 登录获取Access Token
   */
  private async login() {
    try {
      // we-mp-rss登录接口使用application/x-www-form-urlencoded格式
      const params = new URLSearchParams();
      params.append('username', this.username);
      params.append('password', this.password);

      const response = await this.axiosInstance.post(
        '/api/v1/wx/auth/login',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      // we-mp-rss返回的是JWT token,不是session cookie
      if (response.data && response.data.code === 0 && response.data.data) {
        this.accessToken = response.data.data.access_token;
        this.logger.log(`we-mp-rss登录成功,获取到access token: ${this.accessToken.substring(0, 20)}...`);
      } else {
        this.logger.error(`we-mp-rss登录失败: ${JSON.stringify(response.data)}`);
        throw new Error('登录失败,未获取到access_token');
      }

      return this.accessToken;
    } catch (error) {
      this.logger.error(`we-mp-rss登录失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 确保已登录
   */
  private async ensureLoggedIn() {
    if (!this.accessToken) {
      await this.login();
    }
  }

  /**
   * 获取请求头(包含Authorization)
   */
  private async getHeaders() {
    await this.ensureLoggedIn();
    return {
      'Authorization': `Bearer ${this.accessToken}`,
    };
  }

  /**
   * 获取微信公众平台登录二维码
   */
  async getQrCode() {
    try {
      const headers = await this.getHeaders();

      const response = await this.axiosInstance.get(
        '/api/v1/wx/auth/qr/code',
        {
          headers,
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`获取二维码失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取二维码图片
   */
  async getQrImage() {
    try {
      const headers = await this.getHeaders();

      const response = await this.axiosInstance.get(
        '/api/v1/wx/auth/qr/image',
        {
          headers,
          responseType: 'arraybuffer',
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`获取二维码图片失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 检查二维码扫描状态
   */
  async checkQrStatus() {
    try {
      const headers = await this.getHeaders();

      const response = await this.axiosInstance.get(
        '/api/v1/wx/auth/qr/status',
        {
          headers,
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`检查二维码状态失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 搜索公众号
   * @param keyword 搜索关键词
   */
  async searchAccount(keyword: string) {
    try {
      const headers = await this.getHeaders();

      const response = await this.axiosInstance.get(
        `/api/v1/wx/mps/search/${encodeURIComponent(keyword)}`,
        {
          headers,
        },
      );

      this.logger.log(`搜索公众号成功: ${keyword}`);
      return response.data;
    } catch (error) {
      this.logger.error(`搜索公众号失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 添加公众号订阅
   * @param mpData 公众号数据
   */
  async addSubscription(mpData: {
    mp_name: string;
    mp_id: string;
    mp_cover?: string;
    avatar?: string;
    mp_intro?: string;
  }) {
    try {
      const headers = await this.getHeaders();

      const response = await this.axiosInstance.post(
        '/api/v1/wx/mps',
        mpData,
        {
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`成功添加公众号订阅: ${mpData.mp_name}`);
      return response.data;
    } catch (error) {
      this.logger.error(`添加公众号订阅失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取订阅列表
   */
  async getSubscriptions() {
    try {
      const headers = await this.getHeaders();

      const response = await this.axiosInstance.get('/api/v1/wx/mps', {
        headers,
      });

      return response.data;
    } catch (error) {
      this.logger.error(`获取订阅列表失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 删除公众号订阅
   * @param mpId 公众号ID
   */
  async deleteSubscription(mpId: string) {
    try {
      const headers = await this.getHeaders();

      const response = await this.axiosInstance.delete(
        `/api/v1/wx/mps/${mpId}`,
        {
          headers,
        },
      );

      this.logger.log(`成功删除公众号订阅: ${mpId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`删除公众号订阅失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 手动触发更新
   * @param mpId 公众号ID
   */
  async triggerUpdate(mpId: string) {
    try {
      const headers = await this.getHeaders();

      const response = await this.axiosInstance.get(
        `/api/v1/wx/mps/update/${mpId}`,
        {
          headers,
        },
      );

      this.logger.log(`成功触发更新: ${mpId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`触发更新失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取文章列表
   * @param mpId 公众号ID (可选)
   * @param page 页码
   * @param pageSize 每页数量
   */
  async getArticles(mpId?: string, page: number = 0, pageSize: number = 10) {
    try {
      const headers = await this.getHeaders();

      const offset = page * pageSize; // 计算偏移量

      // 构建params对象,只在mpId有值时才添加mp_id参数
      const params: any = {
        offset: offset,  // 使用offset而不是page
        limit: pageSize,  // 使用limit而不是pageSize
      };

      if (mpId) {
        params.mp_id = mpId;
      }

      // 添加详细日志
      this.logger.log(`调用getArticles - mpId: ${mpId}, page: ${page}, pageSize: ${pageSize}`);
      this.logger.log(`请求参数: ${JSON.stringify(params)}`);

      const response = await this.axiosInstance.get(
        '/api/v1/wx/articles',
        {
          params,
          headers,
        },
      );

      // we-mp-rss返回格式: { code: 0, message: "success", data: { list: [...], total: 57 } }
      this.logger.log(`获取文章成功,返回 ${response.data?.data?.list?.length || 0} 篇文章,总数: ${response.data?.data?.total || 0}`);
      return response.data;
    } catch (error) {
      this.logger.error(`获取文章列表失败: ${error.message}`);
      this.logger.error(`错误详情: ${JSON.stringify(error.response?.data || {})}`);
      throw error;
    }
  }

  /**
   * 获取文章详情
   * @param articleId 文章ID
   */
  async getArticleDetail(articleId: string) {
    try {
      const headers = await this.getHeaders();

      const response = await this.axiosInstance.get(
        `/api/v1/wx/articles/${articleId}`,
        {
          headers,
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`获取文章详情失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 检查we-mp-rss服务状态
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${this.weMpRssUrl}/api/v1/wx/sys/base_info`);
      return { status: 'ok', data: response.data };
    } catch (error) {
      this.logger.error(`we-mp-rss服务不可用: ${error.message}`);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * 手动更新公众号文章
   * @param mpId 公众号ID
   * @param startPage 起始页(默认0)
   * @param endPage 结束页(默认10,爬取10页)
   */
  async updateMpArticles(mpId: string, startPage: number = 0, endPage: number = 10) {
    try {
      await this.ensureLoggedIn();

      this.logger.log(`开始手动更新公众号文章: ${mpId}, 页数: ${startPage}-${endPage}`);

      const response = await this.axiosInstance.get(
        `/api/v1/wx/mps/update/${mpId}`,
        {
          params: {
            start_page: startPage,
            end_page: endPage,
          },
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      );

      this.logger.log(`成功触发公众号文章更新: ${mpId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`更新公众号文章失败: ${error.message}`);
      throw error;
    }
  }
}

