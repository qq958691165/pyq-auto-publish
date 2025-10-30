"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PuppeteerModule = void 0;
const common_1 = require("@nestjs/common");
const puppeteer_service_1 = require("./puppeteer.service");
const publish_module_1 = require("../publish/publish.module");
const duixueqiu_accounts_module_1 = require("../duixueqiu-accounts/duixueqiu-accounts.module");
let PuppeteerModule = class PuppeteerModule {
};
exports.PuppeteerModule = PuppeteerModule;
exports.PuppeteerModule = PuppeteerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            (0, common_1.forwardRef)(() => publish_module_1.PublishModule),
            duixueqiu_accounts_module_1.DuixueqiuAccountsModule,
        ],
        providers: [puppeteer_service_1.PuppeteerService],
        exports: [puppeteer_service_1.PuppeteerService],
    })
], PuppeteerModule);
//# sourceMappingURL=puppeteer.module.js.map