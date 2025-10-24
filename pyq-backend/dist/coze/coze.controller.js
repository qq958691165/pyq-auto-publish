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
exports.CozeController = void 0;
const common_1 = require("@nestjs/common");
const coze_service_1 = require("./coze.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let CozeController = class CozeController {
    constructor(cozeService) {
        this.cozeService = cozeService;
    }
    async rewrite(body, req) {
        try {
            const userId = req.user?.userId || 'anonymous';
            if (!body.content) {
                throw new common_1.HttpException('内容不能为空', common_1.HttpStatus.BAD_REQUEST);
            }
            const rewritePromises = [
                this.cozeService.rewriteContent(body.content, userId),
                this.cozeService.rewriteContent(body.content, userId),
                this.cozeService.rewriteContent(body.content, userId),
            ];
            const [version1, version2, version3] = await Promise.all(rewritePromises);
            const history = await this.cozeService.saveRewriteHistory({
                userId,
                articleId: body.articleId,
                originalContent: body.content,
                originalImages: body.images || [],
                rewrittenContent: version1,
                selectedImages: body.images || [],
            });
            return {
                success: true,
                data: {
                    version1,
                    version2,
                    version3,
                    historyId: history.id,
                },
                message: '转写成功',
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || '转写失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getHistory(page = '1', pageSize = '20', req) {
        try {
            const userId = req.user?.userId || 'anonymous';
            const result = await this.cozeService.getRewriteHistory(userId, parseInt(page), parseInt(pageSize));
            return {
                success: true,
                ...result,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || '获取历史失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.CozeController = CozeController;
__decorate([
    (0, common_1.Post)('rewrite'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CozeController.prototype, "rewrite", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CozeController.prototype, "getHistory", null);
exports.CozeController = CozeController = __decorate([
    (0, common_1.Controller)('coze'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [coze_service_1.CozeService])
], CozeController);
//# sourceMappingURL=coze.controller.js.map