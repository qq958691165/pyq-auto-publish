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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigController = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("./config.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const scheduler_service_1 = require("../scheduler/scheduler.service");
let ConfigController = class ConfigController {
    constructor(configService, schedulerService) {
        this.configService = configService;
        this.schedulerService = schedulerService;
    }
    async getAllConfigs() {
        const configs = await this.configService.getAllConfigs();
        return {
            success: true,
            data: configs,
        };
    }
    async getSyncInterval() {
        const interval = await this.configService.getSyncInterval();
        return {
            success: true,
            data: {
                interval_minutes: interval,
            },
        };
    }
    async setSyncInterval(body) {
        const { interval_minutes } = body;
        if (!interval_minutes || interval_minutes < 1) {
            return {
                success: false,
                message: '同步间隔必须大于0分钟',
            };
        }
        const success = await this.configService.setSyncInterval(interval_minutes);
        if (success) {
            await this.schedulerService.updateSyncInterval(interval_minutes);
        }
        return {
            success,
            message: success ? '同步间隔设置成功,定时任务已重启' : '同步间隔设置失败',
        };
    }
};
exports.ConfigController = ConfigController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getAllConfigs", null);
__decorate([
    (0, common_1.Get)('sync-interval'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getSyncInterval", null);
__decorate([
    (0, common_1.Post)('sync-interval'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "setSyncInterval", null);
exports.ConfigController = ConfigController = __decorate([
    (0, common_1.Controller)('config'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => scheduler_service_1.SchedulerService))),
    __metadata("design:paramtypes", [config_service_1.ConfigService,
        scheduler_service_1.SchedulerService])
], ConfigController);
//# sourceMappingURL=config.controller.js.map