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
var ConfigService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../common/supabase.service");
let ConfigService = ConfigService_1 = class ConfigService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.logger = new common_1.Logger(ConfigService_1.name);
    }
    async getConfig(key) {
        try {
            const { data, error } = await this.supabaseService
                .getClient()
                .from('monitor_config')
                .select('config_value')
                .eq('config_key', key)
                .single();
            if (error) {
                this.logger.error(`获取配置失败: ${error.message}`);
                return null;
            }
            return data?.config_value || null;
        }
        catch (error) {
            this.logger.error(`获取配置异常: ${error.message}`);
            return null;
        }
    }
    async setConfig(key, value, description) {
        try {
            const { error } = await this.supabaseService
                .getClient()
                .from('monitor_config')
                .upsert({
                config_key: key,
                config_value: value,
                description: description || '',
            }, {
                onConflict: 'config_key',
            });
            if (error) {
                this.logger.error(`设置配置失败: ${error.message}`);
                return false;
            }
            this.logger.log(`配置已更新: ${key} = ${value}`);
            return true;
        }
        catch (error) {
            this.logger.error(`设置配置异常: ${error.message}`);
            return false;
        }
    }
    async getAllConfigs() {
        try {
            const { data, error } = await this.supabaseService
                .getClient()
                .from('monitor_config')
                .select('*')
                .order('config_key');
            if (error) {
                this.logger.error(`获取所有配置失败: ${error.message}`);
                return [];
            }
            return data || [];
        }
        catch (error) {
            this.logger.error(`获取所有配置异常: ${error.message}`);
            return [];
        }
    }
    async getSyncInterval() {
        const value = await this.getConfig('sync_interval_minutes');
        return value ? parseInt(value, 10) : 30;
    }
    async setSyncInterval(minutes) {
        return this.setConfig('sync_interval_minutes', minutes.toString(), '自动同步文章的时间间隔(分钟)');
    }
};
exports.ConfigService = ConfigService;
exports.ConfigService = ConfigService = ConfigService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ConfigService);
//# sourceMappingURL=config.service.js.map