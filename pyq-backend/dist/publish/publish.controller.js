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
exports.PublishController = void 0;
const common_1 = require("@nestjs/common");
const publish_service_1 = require("./publish.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let PublishController = class PublishController {
    constructor(publishService) {
        this.publishService = publishService;
    }
    async createTask(body, req) {
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
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: '创建发布任务失败',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getTasks(query, req) {
        try {
            const userId = req.user.userId;
            const page = parseInt(query.page) || 1;
            const pageSize = parseInt(query.pageSize) || 20;
            const result = await this.publishService.getUserTasks(userId, page, pageSize);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: '获取任务列表失败',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPendingTasks() {
        try {
            const tasks = await this.publishService.getPendingTasks();
            return {
                success: true,
                data: tasks,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: '获取待发布任务失败',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.PublishController = PublishController;
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PublishController.prototype, "createTask", null);
__decorate([
    (0, common_1.Get)('tasks'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PublishController.prototype, "getTasks", null);
__decorate([
    (0, common_1.Get)('pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PublishController.prototype, "getPendingTasks", null);
exports.PublishController = PublishController = __decorate([
    (0, common_1.Controller)('api/publish'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [publish_service_1.PublishService])
], PublishController);
//# sourceMappingURL=publish.controller.js.map