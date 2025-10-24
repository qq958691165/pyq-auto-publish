"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatMonitorModule = void 0;
const common_1 = require("@nestjs/common");
const wechat_monitor_controller_1 = require("./wechat-monitor.controller");
const wechat_monitor_service_1 = require("./wechat-monitor.service");
const we_mp_rss_service_1 = require("./we-mp-rss.service");
const articles_module_1 = require("../articles/articles.module");
let WechatMonitorModule = class WechatMonitorModule {
};
exports.WechatMonitorModule = WechatMonitorModule;
exports.WechatMonitorModule = WechatMonitorModule = __decorate([
    (0, common_1.Module)({
        imports: [articles_module_1.ArticlesModule],
        controllers: [wechat_monitor_controller_1.WechatMonitorController],
        providers: [wechat_monitor_service_1.WechatMonitorService, we_mp_rss_service_1.WeMpRssService],
        exports: [wechat_monitor_service_1.WechatMonitorService, we_mp_rss_service_1.WeMpRssService],
    })
], WechatMonitorModule);
//# sourceMappingURL=wechat-monitor.module.js.map