"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const wechat_monitor_module_1 = require("./wechat-monitor/wechat-monitor.module");
const articles_module_1 = require("./articles/articles.module");
const scheduler_module_1 = require("./scheduler/scheduler.module");
const config_module_1 = require("./config/config.module");
const coze_module_1 = require("./coze/coze.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            wechat_monitor_module_1.WechatMonitorModule,
            articles_module_1.ArticlesModule,
            scheduler_module_1.SchedulerModule,
            config_module_1.ConfigModule,
            coze_module_1.CozeModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map