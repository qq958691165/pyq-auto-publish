"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PublishService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const axios_1 = __importDefault(require("axios"));
let PublishService = PublishService_1 = class PublishService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PublishService_1.name);
        const supabaseUrl = this.configService.get('SUPABASE_URL');
        const supabaseKey = this.configService.get('SUPABASE_KEY');
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    }
    async onModuleInit() {
        this.logger.log('🚀 初始化发布服务,检查数据库表...');
        await this.ensureTableExists();
    }
    async ensureTableExists() {
        try {
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
            }
            else {
                this.logger.log('✅ publish_tasks表已存在');
            }
        }
        catch (error) {
            this.logger.error('检查数据库表失败:', error.message);
        }
    }
    async createTask(taskData) {
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
        }
        catch (error) {
            this.logger.error('创建发布任务异常:', error);
            throw error;
        }
    }
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
        }
        catch (error) {
            this.logger.error('获取待发布任务异常:', error);
            throw error;
        }
    }
    async updateTaskStatus(taskId, status, errorMessage, duixueqiuTaskId) {
        try {
            const updateData = {
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
        }
        catch (error) {
            this.logger.error('更新任务状态异常:', error);
            throw error;
        }
    }
    async getUserTasks(userId, page = 1, pageSize = 20) {
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
        }
        catch (error) {
            this.logger.error('获取用户任务列表异常:', error);
            throw error;
        }
    }
    async downloadImages(imageUrls) {
        const tempDir = path.join(__dirname, '../../temp_images');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        const localPaths = [];
        for (let i = 0; i < imageUrls.length; i++) {
            try {
                const imageUrl = imageUrls[i];
                const ext = path.extname(imageUrl).split('?')[0] || '.jpg';
                const filename = `image_${Date.now()}_${i}${ext}`;
                const savePath = path.join(tempDir, filename);
                this.logger.log(`下载图片: ${imageUrl} -> ${savePath}`);
                const response = await (0, axios_1.default)({
                    url: imageUrl,
                    method: 'GET',
                    responseType: 'stream',
                    timeout: 30000,
                });
                const writer = fs.createWriteStream(savePath);
                response.data.pipe(writer);
                await new Promise((resolve, reject) => {
                    writer.on('finish', () => resolve());
                    writer.on('error', reject);
                });
                localPaths.push(savePath);
                this.logger.log(`图片下载成功: ${savePath}`);
            }
            catch (error) {
                this.logger.error(`下载图片失败: ${imageUrls[i]}`, error);
                throw error;
            }
        }
        return localPaths;
    }
    cleanupTempImages(imagePaths) {
        for (const imagePath of imagePaths) {
            try {
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                    this.logger.log(`清理临时文件: ${imagePath}`);
                }
            }
            catch (error) {
                this.logger.error(`清理临时文件失败: ${imagePath}`, error);
            }
        }
    }
};
exports.PublishService = PublishService;
exports.PublishService = PublishService = PublishService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PublishService);
//# sourceMappingURL=publish.service.js.map