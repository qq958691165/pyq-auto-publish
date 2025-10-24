"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    app.setGlobalPrefix('api');
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 服务器启动成功!`);
    console.log(`📡 API地址: http://localhost:${port}/api`);
    console.log(`📝 登录接口: http://localhost:${port}/api/auth/login`);
    console.log(`📝 注册接口: http://localhost:${port}/api/auth/register`);
}
bootstrap();
//# sourceMappingURL=main.js.map