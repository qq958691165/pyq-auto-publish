"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishModule = void 0;
const common_1 = require("@nestjs/common");
const publish_controller_1 = require("./publish.controller");
const publish_service_1 = require("./publish.service");
let PublishModule = class PublishModule {
};
exports.PublishModule = PublishModule;
exports.PublishModule = PublishModule = __decorate([
    (0, common_1.Module)({
        controllers: [publish_controller_1.PublishController],
        providers: [publish_service_1.PublishService],
        exports: [publish_service_1.PublishService],
    })
], PublishModule);
//# sourceMappingURL=publish.module.js.map