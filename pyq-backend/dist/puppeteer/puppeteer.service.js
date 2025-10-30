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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PuppeteerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PuppeteerService = void 0;
const common_1 = require("@nestjs/common");
const puppeteer = __importStar(require("puppeteer"));
const publish_service_1 = require("../publish/publish.service");
const duixueqiu_accounts_service_1 = require("../duixueqiu-accounts/duixueqiu-accounts.service");
let PuppeteerService = PuppeteerService_1 = class PuppeteerService {
    constructor(publishService, duixueqiuAccountsService) {
        this.publishService = publishService;
        this.duixueqiuAccountsService = duixueqiuAccountsService;
        this.logger = new common_1.Logger(PuppeteerService_1.name);
    }
    async smartWait(page, checkFunction, options = {}) {
        const { timeout = 10000, fallbackDelay = 2000, description = '条件满足' } = options;
        try {
            await page.waitForFunction(checkFunction, { timeout });
            this.logger.log(`✅ ${description} (动态检测)`);
        }
        catch (error) {
            this.logger.warn(`⚠️ ${description} 超时,使用固定等待 ${fallbackDelay}ms`);
            await new Promise(resolve => setTimeout(resolve, fallbackDelay));
        }
    }
    async waitForDialogOpen(page, timeout = 5000) {
        await this.smartWait(page, () => {
            const dialogs = document.querySelectorAll('.el-dialog__wrapper');
            for (const dialog of dialogs) {
                const style = window.getComputedStyle(dialog);
                if (style.display !== 'none') {
                    return true;
                }
            }
            return false;
        }, { timeout, fallbackDelay: 2000, description: '对话框打开' });
    }
    async waitForDialogClose(page, timeout = 5000) {
        await this.smartWait(page, () => {
            const dialogs = document.querySelectorAll('.el-dialog__wrapper');
            for (const dialog of dialogs) {
                const style = window.getComputedStyle(dialog);
                if (style.display !== 'none') {
                    return false;
                }
            }
            return true;
        }, { timeout, fallbackDelay: 2000, description: '对话框关闭' });
    }
    async waitForNavigation(page, expectedUrl, timeout = 10000) {
        await this.smartWait(page, () => window.location.href.includes(expectedUrl), { timeout, fallbackDelay: 3000, description: `页面跳转到 ${expectedUrl}` });
    }
    async loginToDuixueqiu(userId) {
        const account = await this.duixueqiuAccountsService.getDefaultAccount(userId);
        if (!account) {
            throw new Error('未找到堆雪球账号,请先在"堆雪球账号设置"中添加账号');
        }
        this.logger.log(`使用堆雪球账号: ${account.username}`);
        this.logger.log('启动Puppeteer浏览器...');
        this.logger.log(`环境变量 PUPPETEER_HEADLESS = ${process.env.PUPPETEER_HEADLESS}`);
        const headless = process.env.PUPPETEER_HEADLESS !== 'false';
        this.logger.log(`计算后的 headless = ${headless}`);
        const browser = await puppeteer.launch({
            headless: headless,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--font-render-hinting=none',
                '--disable-font-subpixel-positioning',
                '--lang=zh-CN',
            ],
        });
        this.logger.log(`浏览器模式: ${headless ? '无头模式(不可见)' : '有头模式(可见)'}`);
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'zh-CN,zh;q=0.9',
        });
        this.logger.log('导航到堆雪球登录页面...');
        await page.goto('https://dxqscrm.duixueqiu.cn/admin/#/login', {
            waitUntil: 'networkidle2',
        });
        await page.screenshot({ path: 'debug_1_login_page.png', fullPage: true });
        this.logger.log('截图1: 登录页面已保存');
        await page.waitForSelector('input[placeholder="账号"]', { timeout: 10000 });
        await page.type('input[placeholder="账号"]', account.username);
        await page.type('input[type="password"]', account.password);
        await page.screenshot({ path: 'debug_2_credentials_filled.png', fullPage: true });
        this.logger.log('截图2: 账号密码已填写');
        this.logger.log('查找登录按钮...');
        const loginButtonFound = await page.evaluate(() => {
            const buttons = document.querySelectorAll('button');
            for (const button of buttons) {
                if (button.textContent?.includes('登录')) {
                    return true;
                }
            }
            return false;
        });
        if (!loginButtonFound) {
            this.logger.error('未找到登录按钮!');
            await page.screenshot({ path: 'debug_error_no_login_button.png', fullPage: true });
            throw new Error('未找到登录按钮');
        }
        this.logger.log('点击登录按钮...');
        await page.evaluate(() => {
            const buttons = document.querySelectorAll('button');
            for (const button of buttons) {
                if (button.textContent?.includes('登录')) {
                    button.click();
                    break;
                }
            }
        });
        await page.screenshot({ path: 'debug_3_after_login_click.png', fullPage: true });
        this.logger.log('截图3: 点击登录按钮后');
        this.logger.log('等待登录完成...');
        await this.waitForNavigation(page, '/admin/#/index', 10000);
        await page.screenshot({ path: 'debug_4_after_wait.png', fullPage: true });
        this.logger.log('截图4: 等待完成后');
        const currentUrl = page.url();
        this.logger.log(`当前URL: ${currentUrl}`);
        if (!currentUrl.includes('/admin/#/home')) {
            this.logger.error('登录失败,未跳转到首页');
            await page.screenshot({ path: 'debug_error_login_failed.png', fullPage: true });
            throw new Error('登录失败');
        }
        this.logger.log('✅ 登录成功');
        return { browser, page };
    }
    async publishToDuixueqiu(task) {
        let browser = null;
        let localImagePaths = [];
        try {
            this.logger.log(`开始处理发布任务: ${task.id}`);
            await this.publishService.updateTaskStatus(task.id, 'processing');
            if (task.images && task.images.length > 0) {
                this.logger.log(`开始下载 ${task.images.length} 张图片...`);
                localImagePaths = await this.publishService.downloadImages(task.images);
                this.logger.log(`图片下载完成: ${localImagePaths.length} 张`);
            }
            const userId = task.user_id;
            if (!userId) {
                throw new Error('任务缺少user_id字段');
            }
            const { browser: loggedInBrowser, page } = await this.loginToDuixueqiu(userId);
            browser = loggedInBrowser;
            page.on('console', msg => {
                const text = msg.text();
                if (text.startsWith('[Puppeteer]')) {
                    this.logger.log(`🌐 ${text}`);
                }
            });
            this.logger.log('导航到定时发朋友圈页面...');
            this.logger.log('点击辅助营销菜单...');
            await page.evaluate(() => {
                const xpath = '//*[contains(text(), "辅助营销")]';
                const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                const menu = result.singleNodeValue;
                if (menu) {
                    menu.click();
                }
            });
            await this.smartWait(page, () => {
                const xpath = '//*[contains(text(), "定时发朋友圈")]';
                const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                return result.singleNodeValue !== null;
            }, { timeout: 3000, fallbackDelay: 1000, description: '子菜单出现' });
            this.logger.log('点击定时发朋友圈子菜单...');
            await page.evaluate(() => {
                const xpath = '//*[contains(text(), "定时发朋友圈")]';
                const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                const submenu = result.singleNodeValue;
                if (submenu) {
                    submenu.click();
                }
            });
            await this.smartWait(page, () => {
                const buttons = document.querySelectorAll('button');
                for (const button of buttons) {
                    if (button.textContent?.includes('发朋友圈')) {
                        return true;
                    }
                }
                return false;
            }, { timeout: 5000, fallbackDelay: 2000, description: '页面加载完成' });
            this.logger.log('打开发朋友圈对话框...');
            await page.waitForSelector('button', { timeout: 5000 });
            const buttonClicked = await page.evaluate(() => {
                const buttons = document.querySelectorAll('button');
                for (const button of buttons) {
                    const text = button.textContent?.trim();
                    if (text && text.includes('发朋友圈')) {
                        button.click();
                        return true;
                    }
                }
                return false;
            });
            if (!buttonClicked) {
                this.logger.error('未找到"发朋友圈"按钮');
                throw new Error('未找到"发朋友圈"按钮');
            }
            this.logger.log('等待对话框打开...');
            await this.waitForDialogOpen(page, 5000);
            await page.waitForSelector('input[placeholder="输入任务标题"]', { timeout: 10000 });
            this.logger.log('截图: 对话框打开后');
            await page.screenshot({ path: 'debug_dialog_opened.png', fullPage: true });
            if (task.task_title) {
                this.logger.log(`填写任务标题: ${task.task_title}`);
                await page.type('input[placeholder="输入任务标题"]', task.task_title);
                this.logger.log('任务标题填写完成');
            }
            this.logger.log('点击选择微小号按钮...');
            const selectButtonClicked = await page.evaluate(() => {
                const buttons = document.querySelectorAll('button');
                for (const button of buttons) {
                    const text = button.textContent?.trim();
                    if (text && text.includes('选择微小号')) {
                        button.click();
                        return true;
                    }
                }
                return false;
            });
            if (!selectButtonClicked) {
                this.logger.error('未找到"选择微小号"按钮');
                throw new Error('未找到"选择微小号"按钮');
            }
            await this.smartWait(page, () => {
                const dialogs = document.querySelectorAll('.el-dialog__wrapper');
                for (const dialog of dialogs) {
                    const title = dialog.querySelector('.el-dialog__title');
                    if (title && title.textContent?.includes('选择微小号')) {
                        const style = window.getComputedStyle(dialog);
                        return style.display !== 'none';
                    }
                }
                return false;
            }, { timeout: 5000, fallbackDelay: 2000, description: '微小号选择对话框出现' });
            this.logger.log('点击全选按钮...');
            const selectAllClicked = await page.evaluate(() => {
                const buttons = document.querySelectorAll('button, span, a');
                for (const element of buttons) {
                    const text = element.textContent?.trim();
                    if (text && (text === '全选' || text.includes('全选'))) {
                        element.click();
                        return true;
                    }
                }
                return false;
            });
            if (!selectAllClicked) {
                this.logger.warn('未找到"全选"按钮,尝试选择第一个微小号...');
                await page.evaluate(() => {
                    const checkboxes = document.querySelectorAll('input[type="checkbox"], input[type="radio"]');
                    if (checkboxes.length > 0) {
                        checkboxes[0].click();
                    }
                });
            }
            else {
                this.logger.log('全选按钮点击成功');
            }
            this.logger.log('确认选择微小号...');
            await page.screenshot({ path: 'debug_before_confirm.png', fullPage: true });
            const confirmClicked = await page.evaluate(() => {
                const dialogs = document.querySelectorAll('.el-dialog__wrapper');
                for (const dialog of dialogs) {
                    const title = dialog.querySelector('.el-dialog__title');
                    if (title && title.textContent?.includes('请选择微')) {
                        const footer = dialog.querySelector('.el-dialog__footer');
                        if (footer) {
                            const buttons = footer.querySelectorAll('button');
                            for (const button of buttons) {
                                const text = button.textContent?.trim();
                                if (text === '确 定') {
                                    button.click();
                                    return true;
                                }
                            }
                        }
                    }
                }
                return false;
            });
            if (!confirmClicked) {
                this.logger.error('未找到微小号选择对话框的确定按钮');
                await page.screenshot({ path: 'debug_error_confirm.png', fullPage: true });
                throw new Error('点击微小号选择对话框的确定按钮失败');
            }
            this.logger.log('微小号选择对话框的确定按钮已点击');
            this.logger.log('等待微小号选择对话框关闭...');
            await this.smartWait(page, () => {
                const dialogs = document.querySelectorAll('.el-dialog__wrapper');
                for (const dialog of dialogs) {
                    const title = dialog.querySelector('.el-dialog__title');
                    if (title && title.textContent?.includes('选择微小号')) {
                        const style = window.getComputedStyle(dialog);
                        if (style.display !== 'none') {
                            return false;
                        }
                    }
                }
                return true;
            }, { timeout: 5000, fallbackDelay: 2000, description: '微小号选择对话框关闭' });
            await page.screenshot({ path: 'debug_after_confirm.png', fullPage: true });
            this.logger.log('微小号选择成功');
            if (task.content) {
                this.logger.log('填写朋友圈内容...');
                await page.type('textarea[placeholder="请填写朋友圈内容"]', task.content);
            }
            if (localImagePaths.length > 0) {
                this.logger.log('选择类型为"图片"...');
                await page.evaluate(() => {
                    const items = document.querySelectorAll('li');
                    for (const item of items) {
                        if (item.textContent?.trim() === '图片') {
                            item.click();
                            return;
                        }
                    }
                });
                this.logger.log('等待文件上传输入框出现...');
                await page.waitForSelector('input[type="file"]', { timeout: 5000 });
                this.logger.log(`上传 ${localImagePaths.length} 张图片...`);
                await page.screenshot({ path: 'debug_before_upload.png', fullPage: true });
                const fileInput = await page.$('input[type="file"]');
                if (!fileInput) {
                    this.logger.error('未找到文件上传输入框');
                    await page.screenshot({ path: 'debug_no_file_input.png', fullPage: true });
                    throw new Error('未找到文件上传输入框');
                }
                this.logger.log('找到文件上传输入框,准备上传文件...');
                await fileInput.uploadFile(...localImagePaths);
                this.logger.log('文件已选择,等待上传完成...');
                this.logger.log('等待图片上传完成...');
                try {
                    await page.waitForFunction((expectedCount) => {
                        const fileInputs = document.querySelectorAll('input[type="file"]');
                        for (const input of fileInputs) {
                            const files = input.files;
                            if (files && files.length >= expectedCount) {
                                return true;
                            }
                        }
                        return false;
                    }, { timeout: 10000 }, localImagePaths.length);
                    this.logger.log('✅ 图片文件已选择');
                }
                catch (error) {
                    this.logger.warn('⚠️ 图片上传检测超时,继续执行');
                }
                await page.screenshot({ path: 'debug_after_upload.png', fullPage: true });
                this.logger.log('图片上传完成');
            }
            if (task.is_immediate) {
                this.logger.log('设置为立刻发送...');
                await page.evaluate(() => {
                    const labels = document.querySelectorAll('label, span');
                    for (const label of labels) {
                        if (label.textContent?.includes('立刻发送')) {
                            const checkbox = label.querySelector('input[type="checkbox"]') ||
                                label.previousElementSibling?.querySelector('input[type="checkbox"]') ||
                                label.nextElementSibling?.querySelector('input[type="checkbox"]');
                            if (checkbox) {
                                checkbox.click();
                                break;
                            }
                        }
                    }
                });
            }
            else {
                this.logger.log(`设置定时发送时间: ${task.publish_time}`);
                await page.evaluate(() => {
                    const labels = document.querySelectorAll('label, span');
                    for (const label of labels) {
                        if (label.textContent?.includes('立刻发送')) {
                            const checkbox = label.querySelector('input[type="checkbox"]') ||
                                label.previousElementSibling?.querySelector('input[type="checkbox"]') ||
                                label.nextElementSibling?.querySelector('input[type="checkbox"]');
                            if (checkbox && checkbox.checked) {
                                checkbox.click();
                                break;
                            }
                        }
                    }
                });
                await new Promise(resolve => setTimeout(resolve, 500));
                const publishTime = new Date(task.publish_time);
                const timeString = publishTime
                    .toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                })
                    .replace(/\//g, '-');
                await page.evaluate((time) => {
                    const inputs = document.querySelectorAll('input');
                    for (const input of inputs) {
                        const placeholder = input.getAttribute('placeholder');
                        if (placeholder && placeholder.includes('选择定时发送时间')) {
                            input.value = time;
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                            input.dispatchEvent(new Event('change', { bubbles: true }));
                            break;
                        }
                    }
                }, timeString);
            }
            if (task.random_delay_minutes && task.random_delay_minutes > 0) {
                this.logger.log(`设置随机时间: ${task.random_delay_minutes}分钟`);
                await page.evaluate((minutes) => {
                    const inputs = document.querySelectorAll('input');
                    for (const input of inputs) {
                        const placeholder = input.getAttribute('placeholder');
                        if (placeholder && placeholder.includes('请输入随机时间')) {
                            input.value = minutes.toString();
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                            input.dispatchEvent(new Event('change', { bubbles: true }));
                            break;
                        }
                    }
                }, task.random_delay_minutes);
            }
            if (task.random_content) {
                this.logger.log(`设置随机补充内容: ${task.random_content}`);
                await page.evaluate((content) => {
                    const textareas = document.querySelectorAll('textarea');
                    for (const textarea of textareas) {
                        const placeholder = textarea.getAttribute('placeholder');
                        if (placeholder && placeholder.includes('随机补充内容')) {
                            textarea.value = content;
                            textarea.dispatchEvent(new Event('input', { bubbles: true }));
                            textarea.dispatchEvent(new Event('change', { bubbles: true }));
                            break;
                        }
                    }
                }, task.random_content);
            }
            if (task.use_location) {
                this.logger.log('启用显示定位');
                await page.evaluate(() => {
                    const labels = document.querySelectorAll('label');
                    for (const label of labels) {
                        const text = label.textContent?.trim();
                        if (text && text.includes('显示定位')) {
                            const checkbox = label.querySelector('input[type="checkbox"]');
                            if (checkbox && !checkbox.checked) {
                                checkbox.click();
                            }
                            break;
                        }
                    }
                });
            }
            if (task.comments && task.comments.length > 0) {
                this.logger.log(`设置追评论: ${task.comments.length}条`);
                for (let i = 0; i < task.comments.length; i++) {
                    const comment = task.comments[i];
                    this.logger.log(`添加第${i + 1}条追评论: ${comment}`);
                    await page.evaluate(() => {
                        const buttons = document.querySelectorAll('button');
                        for (const button of buttons) {
                            const text = button.textContent?.trim();
                            if (text && text.includes('添加追评论')) {
                                button.click();
                                break;
                            }
                        }
                    });
                    await new Promise(resolve => setTimeout(resolve, 500));
                    await page.evaluate((commentText) => {
                        const textareas = document.querySelectorAll('textarea');
                        const commentTextarea = textareas[textareas.length - 1];
                        if (commentTextarea) {
                            commentTextarea.value = commentText;
                            commentTextarea.dispatchEvent(new Event('input', { bubbles: true }));
                            commentTextarea.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    }, comment);
                }
            }
            if (localImagePaths.length > 0) {
                this.logger.log('等待图片上传完成...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                this.logger.log('✅ 等待完成');
            }
            this.logger.log('📸 截图: 提交前的表单状态');
            await page.screenshot({ path: 'debug_before_submit.png', fullPage: true });
            this.logger.log('🚀 [步骤18] 开始提交发布任务...');
            this.logger.log('🔍 [步骤18.1] 检查对话框状态...');
            const dialogInfo = await page.evaluate(() => {
                const dialogs = document.querySelectorAll('.el-dialog__wrapper');
                const info = {
                    totalDialogs: dialogs.length,
                    visibleDialogs: 0,
                    hasContentTextarea: false,
                    hasFooter: false,
                    buttonTexts: [],
                };
                for (const dialog of dialogs) {
                    const style = window.getComputedStyle(dialog);
                    if (style.display !== 'none') {
                        info.visibleDialogs++;
                        const hasContentTextarea = dialog.querySelector('textarea[placeholder="请填写朋友圈内容"]');
                        if (hasContentTextarea) {
                            info.hasContentTextarea = true;
                            const footer = dialog.querySelector('.el-dialog__footer');
                            if (footer) {
                                info.hasFooter = true;
                                const buttons = footer.querySelectorAll('button');
                                buttons.forEach(btn => {
                                    info.buttonTexts.push(btn.textContent?.trim() || '');
                                });
                            }
                        }
                    }
                }
                return info;
            });
            this.logger.log(`✅ [步骤18.1] 对话框状态: ${JSON.stringify(dialogInfo)}`);
            this.logger.log('🔄 [步骤18.2] 触发表单验证...');
            await page.evaluate(() => {
                const inputs = document.querySelectorAll('input, textarea');
                inputs.forEach(input => {
                    input.dispatchEvent(new Event('blur', { bubbles: true }));
                });
            });
            this.logger.log('✅ [步骤18.2] 表单验证事件已触发');
            this.logger.log('⏳ [步骤18.3] 等待确定按钮可用...');
            try {
                await page.waitForFunction(() => {
                    const dialogs = document.querySelectorAll('.el-dialog__wrapper');
                    for (const dialog of dialogs) {
                        const style = window.getComputedStyle(dialog);
                        if (style.display === 'none')
                            continue;
                        const hasContentTextarea = dialog.querySelector('textarea[placeholder="请填写朋友圈内容"]');
                        if (!hasContentTextarea)
                            continue;
                        const footer = dialog.querySelector('.el-dialog__footer');
                        if (footer) {
                            const buttons = footer.querySelectorAll('button');
                            for (const button of buttons) {
                                const text = button.textContent?.trim().replace(/\s+/g, '');
                                if (text === '确定') {
                                    return !button.disabled;
                                }
                            }
                        }
                    }
                    return false;
                }, { timeout: 10000 });
                this.logger.log('✅ [步骤18.3] 确定按钮已可用');
            }
            catch (error) {
                this.logger.warn('⚠️ [步骤18.3] 等待确定按钮超时,继续执行');
            }
            this.logger.log('🖱️  [步骤18.4] 提交发布任务...');
            await page.evaluate(() => {
                console.log('[Puppeteer] 开始查找确定按钮...');
                const buttons = document.querySelectorAll('button');
                console.log(`[Puppeteer] 找到 ${buttons.length} 个按钮`);
                for (let i = 0; i < buttons.length; i++) {
                    const button = buttons[i];
                    const text = button.textContent;
                    console.log(`[Puppeteer] 按钮${i}: text="${text}"`);
                    if (text && text.includes('确定')) {
                        console.log(`[Puppeteer] 找到确定按钮! 准备点击...`);
                        button.click();
                        console.log('[Puppeteer] 确定按钮已点击!');
                        return;
                    }
                }
                console.log('[Puppeteer] 未找到确定按钮');
            });
            this.logger.log('✅ [步骤18.4] 确定按钮已点击');
            this.logger.log('⏳ [步骤18.5] 等待提交完成...');
            try {
                await page.waitForFunction(() => {
                    console.log('[Puppeteer] 检查提交结果...');
                    const successElements = document.querySelectorAll('.el-message--success');
                    console.log(`[Puppeteer] 成功提示数量: ${successElements.length}`);
                    if (successElements.length > 0) {
                        console.log('[Puppeteer] 发现成功提示!');
                        return true;
                    }
                    const errorElements = document.querySelectorAll('.el-message--error');
                    console.log(`[Puppeteer] 错误提示数量: ${errorElements.length}`);
                    if (errorElements.length > 0) {
                        console.log('[Puppeteer] 发现错误提示!');
                        return true;
                    }
                    const dialogs = document.querySelectorAll('.el-dialog__wrapper');
                    console.log(`[Puppeteer] 对话框数量: ${dialogs.length}`);
                    let hasVisibleDialog = false;
                    for (const dialog of dialogs) {
                        const style = window.getComputedStyle(dialog);
                        if (style.display !== 'none') {
                            const hasContentTextarea = dialog.querySelector('textarea[placeholder="请填写朋友圈内容"]');
                            if (hasContentTextarea) {
                                console.log('[Puppeteer] 对话框还在,继续等待...');
                                hasVisibleDialog = true;
                                break;
                            }
                        }
                    }
                    if (!hasVisibleDialog) {
                        console.log('[Puppeteer] 对话框已关闭!');
                    }
                    return !hasVisibleDialog;
                }, { timeout: 20000 });
                this.logger.log('✅ [步骤18.5] 提交完成(动态检测 - 对话框已关闭)');
            }
            catch (error) {
                this.logger.error('⚠️ [步骤18.5] 提交超时,对话框未关闭');
                await page.screenshot({ path: 'debug_submit_timeout.png', fullPage: true });
                throw new Error('提交超时,对话框未关闭');
            }
            this.logger.log('检查是否有错误提示...');
            await page.screenshot({ path: 'debug_after_submit_check.png', fullPage: true });
            const errorMessage = await page.evaluate(() => {
                const errorElements = document.querySelectorAll('.el-message--error, .el-message-box__message, .el-message');
                for (const el of errorElements) {
                    const text = el.textContent?.trim();
                    if (text && text.length > 0) {
                        return text;
                    }
                }
                return null;
            });
            if (errorMessage) {
                this.logger.error(`❌ 提交失败,错误信息: ${errorMessage}`);
                await page.screenshot({ path: 'debug_submit_error.png', fullPage: true });
                throw new Error(`提交失败: ${errorMessage}`);
            }
            this.logger.log('✅ 没有发现错误提示');
            this.logger.log('等待对话框关闭...');
            const dialogStillOpen = await page.evaluate(() => {
                const dialogs = document.querySelectorAll('.el-dialog__wrapper');
                let visibleCount = 0;
                dialogs.forEach(dialog => {
                    const style = window.getComputedStyle(dialog);
                    if (style.display !== 'none') {
                        visibleCount++;
                    }
                });
                return visibleCount > 0;
            });
            if (dialogStillOpen) {
                this.logger.error('❌ 对话框仍然打开,提交可能失败!');
                await page.screenshot({ path: 'debug_dialog_still_open.png', fullPage: true });
                const validationError = await page.evaluate(() => {
                    const errorElements = document.querySelectorAll('.el-form-item__error');
                    const errors = [];
                    errorElements.forEach(el => {
                        const text = el.textContent?.trim();
                        if (text)
                            errors.push(text);
                    });
                    return errors.length > 0 ? errors.join(', ') : null;
                });
                if (validationError) {
                    this.logger.error(`❌ 表单验证错误: ${validationError}`);
                    throw new Error(`提交失败: ${validationError}`);
                }
                else {
                    this.logger.error('❌ 对话框未关闭,但没有发现验证错误,可能是其他问题');
                    throw new Error('提交失败: 对话框未关闭');
                }
            }
            this.logger.log('✅ 对话框已关闭');
            const taskTitle = task.task_title || task.taskTitle;
            this.logger.log(`等待任务出现在列表中: ${taskTitle}`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.logger.log('刷新页面以查看最新任务列表...');
            await page.reload({ waitUntil: 'networkidle2' });
            await new Promise(resolve => setTimeout(resolve, 2000));
            if (taskTitle) {
                this.logger.log(`验证任务是否存在: ${taskTitle}`);
                const taskCount = await page.evaluate(() => {
                    const rows = document.querySelectorAll('table tbody tr');
                    return rows.length;
                });
                this.logger.log(`📊 当前页面任务数量: ${taskCount}`);
                if (taskCount === 0) {
                    this.logger.warn('⚠️ 任务列表为空,可能是:');
                    this.logger.warn('  1. 任务提交失败(但没有错误提示)');
                    this.logger.warn('  2. 任务被立即执行并删除');
                    this.logger.warn('  3. 任务在其他页面或标签');
                    const emptyMessage = await page.evaluate(() => {
                        const emptyElements = document.querySelectorAll('.el-table__empty-text, .empty-text');
                        for (const el of emptyElements) {
                            const text = el.textContent?.trim();
                            if (text)
                                return text;
                        }
                        return null;
                    });
                    if (emptyMessage) {
                        this.logger.log(`📝 空列表提示: ${emptyMessage}`);
                    }
                }
                const taskExists = await page.evaluate((title) => {
                    const rows = document.querySelectorAll('table tbody tr');
                    for (const row of rows) {
                        const text = row.textContent || '';
                        if (text.includes(title)) {
                            return true;
                        }
                    }
                    return false;
                }, taskTitle);
                if (!taskExists) {
                    this.logger.error(`❌ 任务未出现在列表中: ${taskTitle}`);
                    await page.screenshot({ path: 'debug_task_not_found.png', fullPage: true });
                    this.logger.warn('⚠️ 任务未在列表中找到,但可能已经被执行,继续流程...');
                }
                else {
                    this.logger.log(`✅ 任务已成功创建并出现在列表中: ${taskTitle}`);
                }
            }
            else {
                this.logger.log('⚠️ 任务没有标题,跳过验证步骤');
            }
            this.logger.log('截图: 提交后的页面状态');
            await page.screenshot({ path: 'debug_after_submit.png', fullPage: true });
            await this.publishService.updateTaskStatus(task.id, 'completed');
            this.logger.log(`发布任务完成: ${task.id}`);
            return {
                success: true,
                taskId: task.id,
            };
        }
        catch (error) {
            this.logger.error(`发布任务失败: ${task.id}`, error);
            await this.publishService.updateTaskStatus(task.id, 'failed', error.message);
            throw error;
        }
        finally {
            if (localImagePaths.length > 0) {
                this.logger.log('清理临时图片文件...');
                this.publishService.cleanupTempImages(localImagePaths);
            }
            if (browser) {
                this.logger.log('关闭浏览器...');
                await browser.close();
            }
        }
    }
    async createFollowCircle(firstTaskTitle, followCircleData, userId) {
        let browser = null;
        try {
            const account = await this.duixueqiuAccountsService.getDefaultAccount(userId);
            if (!account) {
                throw new Error('未找到堆雪球账号,请先在"堆雪球账号设置"中添加账号');
            }
            this.logger.log(`🔄 开始创建跟圈任务: ${followCircleData.title}`);
            this.logger.log(`使用堆雪球账号: ${account.username}`);
            browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu',
                    '--font-render-hinting=none',
                    '--disable-font-subpixel-positioning',
                    '--lang=zh-CN',
                ],
            });
            const page = await browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });
            await this.loginDuixueqiu(page, account.username, account.password);
            this.logger.log('导航到定时发朋友圈页面...');
            await page.goto('https://dxqscrm.duixueqiu.cn/admin/#/assistMarketing/jobPublishWechatMoments', {
                waitUntil: 'networkidle2',
            });
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.logger.log(`查找任务: ${firstTaskTitle}`);
            const followButtonClicked = await page.evaluate((taskTitle) => {
                const rows = document.querySelectorAll('table tbody tr');
                for (const row of rows) {
                    const titleCell = row.querySelector('td:nth-child(1)');
                    if (titleCell && titleCell.textContent?.includes(taskTitle)) {
                        const buttons = row.querySelectorAll('button');
                        for (const button of buttons) {
                            if (button.textContent?.includes('跟圈')) {
                                button.click();
                                return true;
                            }
                        }
                    }
                }
                return false;
            }, firstTaskTitle);
            if (!followButtonClicked) {
                throw new Error(`未找到任务: ${firstTaskTitle}`);
            }
            this.logger.log('等待跟圈对话框打开...');
            await this.waitForDialogOpen(page, 5000);
            await page.waitForSelector('.el-dialog__wrapper', { timeout: 10000 });
            this.logger.log(`填写任务标题: ${followCircleData.title}`);
            await page.evaluate((title) => {
                const inputs = document.querySelectorAll('input');
                for (const input of inputs) {
                    const placeholder = input.getAttribute('placeholder');
                    if (placeholder && placeholder.includes('输入任务标题')) {
                        input.value = title;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                        break;
                    }
                }
            }, followCircleData.title);
            this.logger.log(`设置发布时间: ${followCircleData.publishTime.toISOString()}`);
            await page.evaluate(() => {
                const checkboxes = document.querySelectorAll('input[type="checkbox"]');
                for (const checkbox of checkboxes) {
                    const label = checkbox.parentElement?.textContent;
                    if (label && label.includes('立刻发送')) {
                        if (checkbox.checked) {
                            checkbox.click();
                        }
                        break;
                    }
                }
            });
            const timeString = this.formatDateTime(followCircleData.publishTime);
            await page.evaluate((time) => {
                const inputs = document.querySelectorAll('input');
                for (const input of inputs) {
                    const placeholder = input.getAttribute('placeholder');
                    if (placeholder && placeholder.includes('选择定时发送时间')) {
                        input.value = time;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                        break;
                    }
                }
            }, timeString);
            this.logger.log('点击确定按钮...');
            await page.evaluate(() => {
                const buttons = document.querySelectorAll('button');
                for (const button of buttons) {
                    if (button.textContent?.trim() === '确定') {
                        button.click();
                        break;
                    }
                }
            });
            await this.waitForDialogClose(page, 5000);
            this.logger.log(`✅ 跟圈任务创建成功: ${followCircleData.title}`);
        }
        catch (error) {
            this.logger.error(`❌ 创建跟圈任务失败: ${error.message}`, error.stack);
            throw error;
        }
        finally {
            if (browser) {
                await browser.close();
            }
        }
    }
    async deleteCircleByTitleAndContent(deleteTitle, deleteContent, userId) {
        let browser = null;
        try {
            const account = await this.duixueqiuAccountsService.getDefaultAccount(userId);
            if (!account) {
                throw new Error('未找到堆雪球账号,请先在"堆雪球账号设置"中添加账号');
            }
            this.logger.log(`🗑️ 开始删除任务: ${deleteTitle}`);
            this.logger.log(`使用堆雪球账号: ${account.username}`);
            browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu',
                    '--font-render-hinting=none',
                    '--disable-font-subpixel-positioning',
                    '--lang=zh-CN',
                ],
            });
            const page = await browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });
            await this.loginDuixueqiu(page, account.username, account.password);
            this.logger.log('导航到定时发朋友圈页面...');
            await page.goto('https://dxqscrm.duixueqiu.cn/admin/#/assistMarketing/jobPublishWechatMoments', {
                waitUntil: 'networkidle2',
            });
            await this.smartWait(page, () => {
                const rows = document.querySelectorAll('table tbody tr');
                return rows.length > 0;
            }, { timeout: 5000, fallbackDelay: 2000, description: '任务列表加载完成' });
            const contentPrefix = deleteContent.substring(0, 50);
            const deleteSuccess = await page.evaluate((title, content) => {
                const rows = document.querySelectorAll('table tbody tr');
                for (const row of rows) {
                    const titleCell = row.querySelector('td:nth-child(1)');
                    const titleText = titleCell?.textContent?.trim() || '';
                    const contentCell = row.querySelector('td:nth-child(3)');
                    const contentText = contentCell?.textContent?.trim() || '';
                    if (titleText.includes(title) && contentText.includes(content)) {
                        console.log(`✅ 找到匹配任务: ${title}`);
                        const buttons = row.querySelectorAll('button');
                        for (const button of buttons) {
                            if (button.textContent?.includes('删除')) {
                                button.click();
                                return true;
                            }
                        }
                    }
                }
                return false;
            }, deleteTitle, contentPrefix);
            if (!deleteSuccess) {
                this.logger.warn(`⚠️ 未找到匹配任务: ${deleteTitle}`);
                return false;
            }
            await this.smartWait(page, () => {
                const buttons = document.querySelectorAll('button');
                for (const button of buttons) {
                    if (button.textContent?.trim() === '确定') {
                        return true;
                    }
                }
                return false;
            }, { timeout: 3000, fallbackDelay: 1000, description: '确认对话框出现' });
            const confirmClicked = await page.evaluate(() => {
                const buttons = document.querySelectorAll('button');
                for (const button of buttons) {
                    if (button.textContent?.trim() === '确定') {
                        button.click();
                        return true;
                    }
                }
                return false;
            });
            if (confirmClicked) {
                this.logger.log(`✅ 删除成功: ${deleteTitle}`);
                return true;
            }
            else {
                this.logger.warn(`⚠️ 未找到确认按钮`);
                return false;
            }
        }
        catch (error) {
            this.logger.error(`❌ 删除任务失败: ${error.message}`, error.stack);
            return false;
        }
        finally {
            if (browser) {
                await browser.close();
            }
        }
    }
    async loginDuixueqiu(page, username, password) {
        this.logger.log('导航到堆雪球登录页面...');
        await page.goto('https://dxqscrm.duixueqiu.cn/admin/#/login', {
            waitUntil: 'networkidle2',
        });
        await page.waitForSelector('input[placeholder="账号"]', { timeout: 10000 });
        await page.type('input[placeholder="账号"]', username);
        await new Promise(resolve => setTimeout(resolve, 500));
        await page.type('input[type="password"]', password);
        await new Promise(resolve => setTimeout(resolve, 500));
        await page.evaluate(() => {
            const buttons = document.querySelectorAll('button');
            for (const button of buttons) {
                if (button.textContent?.includes('登录')) {
                    button.click();
                    break;
                }
            }
        });
        await new Promise(resolve => setTimeout(resolve, 5000));
        const currentUrl = page.url();
        if (currentUrl.includes('/login')) {
            throw new Error('登录失败,仍在登录页面');
        }
        this.logger.log('✅ 登录成功');
    }
    formatDateTime(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    async publishFollowCircles(firstCircleData, followCircles, userId) {
        let browser = null;
        let localImagePaths = [];
        try {
            this.logger.log('🚀 开始跟圈自动化流程...');
            if (firstCircleData.images && firstCircleData.images.length > 0) {
                this.logger.log(`开始下载 ${firstCircleData.images.length} 张图片...`);
                localImagePaths = await this.publishService.downloadImages(firstCircleData.images);
                this.logger.log(`图片下载完成: ${localImagePaths.length} 张`);
            }
            const { browser: loggedInBrowser, page } = await this.loginToDuixueqiu(userId);
            browser = loggedInBrowser;
            this.logger.log(`📤 发布第1条朋友圈: ${firstCircleData.title}`);
            await this.publishCircleInPage(page, firstCircleData, localImagePaths, true);
            this.logger.log(`✅ 第1条朋友圈发布成功`);
            this.logger.log('等待第1条任务出现在列表中...');
            try {
                await page.waitForFunction((taskTitle) => {
                    const rows = document.querySelectorAll('table tbody tr');
                    for (const row of rows) {
                        if (row.textContent?.includes(taskTitle)) {
                            return true;
                        }
                    }
                    return false;
                }, { timeout: 10000 }, firstCircleData.title);
                this.logger.log('第1条任务已出现在列表中');
            }
            catch (error) {
                this.logger.warn('动态检测第1条任务超时,使用固定等待');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
            for (let i = 0; i < followCircles.length; i++) {
                const followCircle = followCircles[i];
                this.logger.log(`🔄 创建跟圈任务 ${i + 1}/${followCircles.length}: ${followCircle.title}`);
                await this.createFollowCircleInPage(page, firstCircleData.title, followCircle);
                this.logger.log(`✅ 跟圈任务 ${i + 1} 创建成功`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            this.logger.log('🎉 所有跟圈任务创建完成!');
        }
        catch (error) {
            this.logger.error('❌ 跟圈自动化失败:', error);
            throw error;
        }
        finally {
            if (browser) {
                this.logger.log('关闭浏览器...');
                await browser.close();
            }
        }
    }
    async publishCircleInPage(page, circleData, localImagePaths, isImmediate) {
        this.logger.log('导航到定时发朋友圈页面...');
        await page.evaluate(() => {
            const xpath = '//*[contains(text(), "辅助营销")]';
            const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            const menu = result.singleNodeValue;
            if (menu)
                menu.click();
        });
        await this.smartWait(page, () => {
            const xpath = '//*[contains(text(), "定时发朋友圈")]';
            const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            return result.singleNodeValue !== null;
        }, { timeout: 3000, fallbackDelay: 1000, description: '子菜单出现' });
        await page.evaluate(() => {
            const xpath = '//*[contains(text(), "定时发朋友圈")]';
            const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            const submenu = result.singleNodeValue;
            if (submenu)
                submenu.click();
        });
        await this.smartWait(page, () => {
            const buttons = document.querySelectorAll('button');
            for (const button of buttons) {
                if (button.textContent?.includes('发朋友圈')) {
                    return true;
                }
            }
            return false;
        }, { timeout: 5000, fallbackDelay: 2000, description: '页面加载完成' });
        this.logger.log('打开发朋友圈对话框...');
        await page.evaluate(() => {
            const buttons = document.querySelectorAll('button');
            for (const button of buttons) {
                if (button.textContent?.includes('发朋友圈')) {
                    button.click();
                    return;
                }
            }
        });
        await this.waitForDialogOpen(page, 5000);
        this.logger.log('填写任务标题...');
        await page.waitForSelector('input[placeholder="输入任务标题"]');
        await page.type('input[placeholder="输入任务标题"]', circleData.title);
        this.logger.log('任务标题填写完成');
        this.logger.log('点击选择微小号按钮...');
        await page.evaluate(() => {
            const buttons = document.querySelectorAll('button');
            for (const button of buttons) {
                if (button.textContent?.includes('选择微小号')) {
                    button.click();
                    return;
                }
            }
        });
        await this.smartWait(page, () => {
            const dialogs = document.querySelectorAll('.el-dialog__wrapper');
            for (const dialog of dialogs) {
                const title = dialog.querySelector('.el-dialog__title');
                if (title && title.textContent?.includes('选择微小号')) {
                    const style = window.getComputedStyle(dialog);
                    return style.display !== 'none';
                }
            }
            return false;
        }, { timeout: 5000, fallbackDelay: 2000, description: '微小号选择对话框出现' });
        this.logger.log('点击全选按钮...');
        const allSelectClicked = await page.evaluate(() => {
            const buttons = document.querySelectorAll('button, span, a');
            for (const element of buttons) {
                const text = element.textContent?.trim();
                if (text && (text === '全选' || text.includes('全选'))) {
                    element.click();
                    return true;
                }
            }
            return false;
        });
        if (!allSelectClicked) {
            this.logger.warn('未找到"全选"按钮,尝试选择第一个微小号...');
            await page.evaluate(() => {
                const checkboxes = document.querySelectorAll('input[type="checkbox"], input[type="radio"]');
                if (checkboxes.length > 0) {
                    checkboxes[0].click();
                }
            });
        }
        else {
            this.logger.log('全选按钮点击成功');
        }
        this.logger.log('确认选择微小号...');
        const confirmClicked = await page.evaluate(() => {
            const dialogs = document.querySelectorAll('.el-dialog__wrapper');
            for (const dialog of dialogs) {
                const title = dialog.querySelector('.el-dialog__title');
                if (title && title.textContent?.includes('请选择微')) {
                    const footer = dialog.querySelector('.el-dialog__footer');
                    if (footer) {
                        const buttons = footer.querySelectorAll('button');
                        for (const button of buttons) {
                            const text = button.textContent?.trim();
                            if (text === '确 定') {
                                button.click();
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        });
        if (!confirmClicked) {
            this.logger.error('未找到微小号选择对话框的确定按钮');
            await page.screenshot({ path: 'debug_error_confirm.png', fullPage: true });
            throw new Error('点击微小号选择对话框的确定按钮失败');
        }
        this.logger.log('微小号选择对话框的确定按钮已点击');
        this.logger.log('等待微小号选择对话框关闭...');
        await this.smartWait(page, () => {
            const dialogs = document.querySelectorAll('.el-dialog__wrapper');
            for (const dialog of dialogs) {
                const title = dialog.querySelector('.el-dialog__title');
                if (title && title.textContent?.includes('选择微小号')) {
                    const style = window.getComputedStyle(dialog);
                    if (style.display !== 'none') {
                        return false;
                    }
                }
            }
            return true;
        }, { timeout: 5000, fallbackDelay: 2000, description: '微小号选择对话框关闭' });
        this.logger.log('微小号选择成功');
        this.logger.log('填写朋友圈内容...');
        await page.evaluate((content) => {
            const textareas = document.querySelectorAll('textarea');
            for (const textarea of textareas) {
                const placeholder = textarea.getAttribute('placeholder');
                if (placeholder && placeholder.includes('请填写朋友圈内容')) {
                    textarea.value = content;
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                    textarea.dispatchEvent(new Event('change', { bubbles: true }));
                    return;
                }
            }
        }, circleData.content);
        if (localImagePaths && localImagePaths.length > 0) {
            this.logger.log(`准备上传 ${localImagePaths.length} 张图片...`);
            this.logger.log('选择类型为"图片"...');
            await page.evaluate(() => {
                const items = document.querySelectorAll('li');
                for (const item of items) {
                    if (item.textContent?.trim() === '图片') {
                        item.click();
                        return;
                    }
                }
            });
            this.logger.log(`上传 ${localImagePaths.length} 张图片...`);
            const fileInput = await page.$('input[type="file"]');
            if (!fileInput) {
                this.logger.error('未找到文件上传输入框');
                await page.screenshot({ path: 'debug_no_file_input.png', fullPage: true });
                throw new Error('未找到文件上传输入框');
            }
            this.logger.log('找到文件上传输入框,准备上传文件...');
            await fileInput.uploadFile(...localImagePaths);
            this.logger.log('文件已选择,等待上传完成...');
            try {
                await page.waitForFunction(() => {
                    const progressBars = document.querySelectorAll('.el-progress, .el-upload-list__item-status-label');
                    if (progressBars.length === 0)
                        return true;
                    for (const bar of progressBars) {
                        const text = bar.textContent || '';
                        if (text.includes('上传中') || text.includes('%')) {
                            return false;
                        }
                    }
                    return true;
                }, { timeout: 30000 });
                this.logger.log('图片上传完成(动态检测)');
            }
            catch (error) {
                this.logger.warn('动态检测上传状态失败,使用固定等待');
                await new Promise(resolve => setTimeout(resolve, 15000));
                this.logger.log('图片上传完成(固定等待)');
            }
        }
        if (isImmediate) {
            this.logger.log('设置为立刻发送...');
            await page.evaluate(() => {
                const radios = document.querySelectorAll('input[type="radio"]');
                for (const radio of radios) {
                    const label = radio.parentElement;
                    if (label?.textContent?.includes('立刻发送')) {
                        radio.click();
                        return;
                    }
                }
            });
        }
        await page.screenshot({ path: 'debug_before_submit.png', fullPage: true });
        this.logger.log('截图: 提交前的表单状态');
        this.logger.log('提交发布任务...');
        await page.evaluate(() => {
            const buttons = document.querySelectorAll('button');
            for (const button of buttons) {
                if (button.textContent?.includes('确定')) {
                    button.click();
                    return;
                }
            }
        });
        this.logger.log('等待提交完成...');
        try {
            await page.waitForFunction(() => {
                const successElements = document.querySelectorAll('.el-message--success');
                if (successElements.length > 0)
                    return true;
                const errorElements = document.querySelectorAll('.el-message--error');
                if (errorElements.length > 0)
                    return true;
                const dialogs = document.querySelectorAll('.el-dialog__wrapper');
                let hasVisibleDialog = false;
                for (const dialog of dialogs) {
                    const style = window.getComputedStyle(dialog);
                    if (style.display !== 'none') {
                        hasVisibleDialog = true;
                        break;
                    }
                }
                return !hasVisibleDialog;
            }, { timeout: 10000 });
            this.logger.log('提交完成(动态检测)');
        }
        catch (error) {
            this.logger.warn('动态检测提交状态超时');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        this.logger.log('检查是否有错误提示...');
        const errorMessage = await page.evaluate(() => {
            const errorElements = document.querySelectorAll('.el-message--error, .el-message-box__message');
            for (const el of errorElements) {
                const text = el.textContent?.trim();
                if (text && text.length > 0)
                    return text;
            }
            return null;
        });
        if (errorMessage) {
            this.logger.error(`❌ 提交失败,错误信息: ${errorMessage}`);
            await page.screenshot({ path: 'debug_submit_error.png', fullPage: true });
            throw new Error(`提交失败: ${errorMessage}`);
        }
        await page.screenshot({ path: 'debug_after_submit.png', fullPage: true });
        this.logger.log('截图: 提交后的页面状态');
    }
    async createFollowCircleInPage(page, sourceTaskTitle, followCircle) {
        this.logger.log(`查找任务: ${sourceTaskTitle}`);
        const taskFound = await page.evaluate((taskTitle) => {
            const rows = document.querySelectorAll('table tbody tr');
            for (const row of rows) {
                if (row.textContent?.includes(taskTitle)) {
                    return true;
                }
            }
            return false;
        }, sourceTaskTitle);
        if (!taskFound) {
            throw new Error(`未找到任务: ${sourceTaskTitle}`);
        }
        await page.evaluate((taskTitle) => {
            const rows = document.querySelectorAll('table tbody tr');
            for (const row of rows) {
                if (row.textContent?.includes(taskTitle)) {
                    const buttons = row.querySelectorAll('button');
                    for (const button of buttons) {
                        if (button.textContent?.includes('跟圈')) {
                            button.click();
                            return;
                        }
                    }
                }
            }
        }, sourceTaskTitle);
        await this.waitForDialogOpen(page, 5000);
        this.logger.log(`📝 修改任务标题为: ${followCircle.title}`);
        await page.waitForSelector('input[placeholder="输入任务标题"]');
        await page.evaluate(() => {
            const input = document.querySelector('input[placeholder="输入任务标题"]');
            if (input)
                input.value = '';
        });
        await page.type('input[placeholder="输入任务标题"]', followCircle.title);
        this.logger.log('点击选择微小号按钮...');
        await page.evaluate(() => {
            const buttons = document.querySelectorAll('button');
            for (const button of buttons) {
                if (button.textContent?.includes('选择微小号')) {
                    button.click();
                    return;
                }
            }
        });
        await this.smartWait(page, () => {
            const dialogs = document.querySelectorAll('.el-dialog__wrapper');
            for (const dialog of dialogs) {
                const title = dialog.querySelector('.el-dialog__title');
                if (title && title.textContent?.includes('选择微小号')) {
                    const style = window.getComputedStyle(dialog);
                    return style.display !== 'none';
                }
            }
            return false;
        }, { timeout: 5000, fallbackDelay: 2000, description: '微小号选择对话框出现' });
        this.logger.log('点击全选按钮...');
        const allSelectClicked = await page.evaluate(() => {
            const buttons = document.querySelectorAll('button, span, a');
            for (const element of buttons) {
                const text = element.textContent?.trim();
                if (text && (text === '全选' || text.includes('全选'))) {
                    element.click();
                    return true;
                }
            }
            return false;
        });
        if (!allSelectClicked) {
            this.logger.warn('未找到"全选"按钮,尝试选择第一个微小号...');
            await page.evaluate(() => {
                const checkboxes = document.querySelectorAll('input[type="checkbox"], input[type="radio"]');
                if (checkboxes.length > 0) {
                    checkboxes[0].click();
                }
            });
        }
        else {
            this.logger.log('全选按钮点击成功');
        }
        this.logger.log('确认选择微小号...');
        const confirmClicked = await page.evaluate(() => {
            const dialogs = document.querySelectorAll('.el-dialog__wrapper');
            for (const dialog of dialogs) {
                const title = dialog.querySelector('.el-dialog__title');
                if (title && title.textContent?.includes('请选择微')) {
                    const footer = dialog.querySelector('.el-dialog__footer');
                    if (footer) {
                        const buttons = footer.querySelectorAll('button');
                        for (const button of buttons) {
                            const text = button.textContent?.trim();
                            if (text === '确 定') {
                                button.click();
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        });
        if (!confirmClicked) {
            this.logger.error('未找到微小号选择对话框的确定按钮');
            throw new Error('点击微小号选择对话框的确定按钮失败');
        }
        this.logger.log('微小号选择成功');
        await this.smartWait(page, () => {
            const dialogs = document.querySelectorAll('.el-dialog__wrapper');
            for (const dialog of dialogs) {
                const title = dialog.querySelector('.el-dialog__title');
                if (title && title.textContent?.includes('选择微小号')) {
                    const style = window.getComputedStyle(dialog);
                    if (style.display !== 'none') {
                        return false;
                    }
                }
            }
            return true;
        }, { timeout: 5000, fallbackDelay: 2000, description: '微小号选择对话框关闭' });
        const timeString = this.formatDateTime(followCircle.publishTime);
        await page.evaluate((time) => {
            const inputs = document.querySelectorAll('input[type="text"]');
            for (const input of inputs) {
                const placeholder = input.getAttribute('placeholder');
                if (placeholder?.includes('选择日期时间')) {
                    input.value = time;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    return;
                }
            }
        }, timeString);
        await page.evaluate(() => {
            const buttons = document.querySelectorAll('button');
            for (const button of buttons) {
                if (button.textContent?.includes('确定')) {
                    button.click();
                    return;
                }
            }
        });
        await this.smartWait(page, () => {
            const successElements = document.querySelectorAll('.el-message--success');
            if (successElements.length > 0)
                return true;
            const errorElements = document.querySelectorAll('.el-message--error');
            if (errorElements.length > 0)
                return true;
            const dialogs = document.querySelectorAll('.el-dialog__wrapper');
            let hasVisibleDialog = false;
            for (const dialog of dialogs) {
                const style = window.getComputedStyle(dialog);
                if (style.display !== 'none') {
                    hasVisibleDialog = true;
                    break;
                }
            }
            return !hasVisibleDialog;
        }, { timeout: 10000, fallbackDelay: 2000, description: '提交完成' });
        const errorMessage = await page.evaluate(() => {
            const errorElements = document.querySelectorAll('.el-message--error');
            for (const el of errorElements) {
                const text = el.textContent?.trim();
                if (text && text.length > 0)
                    return text;
            }
            return null;
        });
        if (errorMessage) {
            throw new Error(`创建跟圈任务失败: ${errorMessage}`);
        }
    }
    async deleteCircleByTitle(taskTitle, userId) {
        let browser = null;
        try {
            this.logger.log(`开始删除朋友圈,标题: ${taskTitle}`);
            const { browser: loggedInBrowser, page } = await this.loginToDuixueqiu(userId);
            browser = loggedInBrowser;
            this.logger.log('导航到定时发朋友圈页面...');
            await page.evaluate(() => {
                const xpath = '//*[contains(text(), "辅助营销")]';
                const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                const menu = result.singleNodeValue;
                if (menu) {
                    menu.click();
                }
            });
            await this.smartWait(page, () => {
                const xpath = '//*[contains(text(), "定时发朋友圈")]';
                const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                return result.singleNodeValue !== null;
            }, { timeout: 3000, fallbackDelay: 1000, description: '子菜单出现' });
            await page.evaluate(() => {
                const xpath = '//*[contains(text(), "定时发朋友圈")]';
                const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                const submenu = result.singleNodeValue;
                if (submenu) {
                    submenu.click();
                }
            });
            await this.smartWait(page, () => {
                const rows = document.querySelectorAll('table tbody tr');
                return rows.length > 0;
            }, { timeout: 5000, fallbackDelay: 2000, description: '任务列表加载完成' });
            this.logger.log(`查找标题为"${taskTitle}"的朋友圈...`);
            const deleteClicked = await page.evaluate((title) => {
                const rows = document.querySelectorAll('tr');
                for (const row of rows) {
                    const cells = row.querySelectorAll('td');
                    let foundTitle = false;
                    for (const cell of cells) {
                        if (cell.textContent?.includes(title)) {
                            foundTitle = true;
                            break;
                        }
                    }
                    if (foundTitle) {
                        const buttons = row.querySelectorAll('button');
                        for (const button of buttons) {
                            const text = button.textContent?.trim();
                            if (text && text.includes('删除')) {
                                button.click();
                                return true;
                            }
                        }
                    }
                }
                return false;
            }, taskTitle);
            if (!deleteClicked) {
                this.logger.warn(`未找到标题为"${taskTitle}"的朋友圈`);
                await page.screenshot({ path: `debug_delete_not_found_${Date.now()}.png`, fullPage: true });
                throw new Error(`未找到标题为"${taskTitle}"的朋友圈`);
            }
            this.logger.log('删除按钮已点击,等待确认对话框...');
            await this.smartWait(page, () => {
                const buttons = document.querySelectorAll('button');
                for (const button of buttons) {
                    if (button.textContent?.trim() === '是') {
                        return true;
                    }
                }
                return false;
            }, { timeout: 3000, fallbackDelay: 1000, description: '确认对话框出现' });
            const confirmClicked = await page.evaluate(() => {
                const buttons = document.querySelectorAll('button');
                for (const button of buttons) {
                    const text = button.textContent?.trim();
                    if (text === '是' || text === '确定' || text === '确认') {
                        button.click();
                        return true;
                    }
                }
                return false;
            });
            if (!confirmClicked) {
                this.logger.error('未找到确认删除按钮');
                await page.screenshot({ path: `debug_delete_confirm_not_found_${Date.now()}.png`, fullPage: true });
                throw new Error('未找到确认删除按钮');
            }
            this.logger.log('确认删除按钮已点击');
            await this.smartWait(page, () => {
                const successElements = document.querySelectorAll('.el-message--success');
                return successElements.length > 0;
            }, { timeout: 5000, fallbackDelay: 2000, description: '删除成功提示出现' });
            const stillExists = await page.evaluate((title) => {
                const rows = document.querySelectorAll('tr');
                for (const row of rows) {
                    const cells = row.querySelectorAll('td');
                    for (const cell of cells) {
                        if (cell.textContent?.includes(title)) {
                            return true;
                        }
                    }
                }
                return false;
            }, taskTitle);
            if (stillExists) {
                this.logger.warn(`删除后仍然找到标题为"${taskTitle}"的朋友圈,可能删除失败`);
                await page.screenshot({ path: `debug_delete_still_exists_${Date.now()}.png`, fullPage: true });
            }
            else {
                this.logger.log(`✅ 朋友圈删除成功: ${taskTitle}`);
            }
        }
        catch (error) {
            this.logger.error(`删除朋友圈失败: ${error.message}`);
            throw error;
        }
        finally {
            if (browser) {
                await browser.close();
                this.logger.log('浏览器已关闭');
            }
        }
    }
};
exports.PuppeteerService = PuppeteerService;
exports.PuppeteerService = PuppeteerService = PuppeteerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => publish_service_1.PublishService))),
    __metadata("design:paramtypes", [publish_service_1.PublishService,
        duixueqiu_accounts_service_1.DuixueqiuAccountsService])
], PuppeteerService);
//# sourceMappingURL=puppeteer.service.js.map