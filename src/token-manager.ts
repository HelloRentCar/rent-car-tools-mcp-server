/**
 * @author Shi Chenxi (AI generated)
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { chromium } from 'playwright-chromium';
import { logger } from './logger.js';

/**
 * Token管理器，用于处理与token相关的操作
 */
export class TokenManager {
  private tokenFilePath: string;
  private userDataDirPath: string;
  private readonly TOKEN_URL: string = 'https://hitch-operation-admin.hellobike.cn/getToken';

  constructor() {
    // 获取用户主目录
    const homeDir = os.homedir();
    // 构建.hellobike目录路径
    const hellobikeDirPath = path.join(homeDir, '.hellobike');

    // 确保.hellobike目录存在
    if (!fs.existsSync(hellobikeDirPath)) {
      fs.mkdirSync(hellobikeDirPath, { recursive: true });
    }

    // 构建token文件的完整路径
    this.tokenFilePath = path.join(hellobikeDirPath, 'token');

    // 构建Chrome用户数据目录路径
    this.userDataDirPath = path.join(hellobikeDirPath, 'chrome-user-data');

    // 确保Chrome用户数据目录存在
    if (!fs.existsSync(this.userDataDirPath)) {
      fs.mkdirSync(this.userDataDirPath, { recursive: true });
    }

    logger.info('TokenManager初始化完成');
  }

  /**
   * 从本地文件读取token
   * @returns 返回token内容，如果文件不存在或读取失败则返回null
   */
  public readTokenFromLocal(): string | null {
    try {
      // 检查文件是否存在
      if (!fs.existsSync(this.tokenFilePath)) {
        logger.warn('Token文件不存在');
        return null;
      }

      // 读取文件内容
      const tokenContent = fs.readFileSync(this.tokenFilePath, 'utf-8');
      logger.info('Token文件读取成功');
      return tokenContent.trim();
    } catch (error) {
      logger.error({ error }, '读取token文件失败');
      return null;
    }
  }

  /**
   * 获取token，先尝试从本地读取，如果没有则打开浏览器获取
   * @returns Promise<string|null> 获取到的token，如果未能获取则返回null
   */
  public async getToken(): Promise<string | null> {
    // 先尝试从本地读取token
    const localToken = this.readTokenFromLocal();
    if (localToken) {
      logger.info('成功从本地获取token');
      return localToken;
    }

    // 本地没有token，打开浏览器获取
    logger.info('本地没有找到token，尝试打开浏览器获取');
    return this.openBrowserForToken();
  }

  /**
   * 打开Chrome浏览器并引导用户获取token
   * @returns Promise<string|null> 获取到的token，如果未能获取则返回null
   */
  public async openBrowserForToken(): Promise<string | null> {
    let context = null;

    try {
      const browsers = ['chrome', 'msedge'];
      // 依次尝试使用定义的浏览器
      let browserLaunched = false;
      
      for (const browser of browsers) {
        try {
          logger.info(`尝试使用${browser}浏览器`);
          context = await chromium.launchPersistentContext(this.userDataDirPath, {
            headless: false,     // 显示浏览器界面
            channel: browser,    // 使用指定的浏览器
            slowMo: 50           // 稍微放慢操作，便于用户查看
          });
          logger.info(`成功启动${browser}浏览器`);
          browserLaunched = true;
          break;
        } catch (error) {
          logger.warn(`启动${browser}浏览器失败: ${error instanceof Error ? error.message : error}`);
        }
      }
      
      if (!browserLaunched) {
        logger.error('所有浏览器都启动失败');
        throw new Error('无法启动任何受支持的浏览器');
      }

      const page = await context!!.newPage();

      // 导航到获取token的页面，仅等待DOM内容加载完成，不等待所有资源
      await page.goto(this.TOKEN_URL, { waitUntil: 'domcontentloaded' });
      
      // 等待1秒，确保页面完全加载
      await page.waitForTimeout(1000);

      logger.info('浏览器已打开，等待用户操作完成');

      // 轮询检查URL和DOM
      let token: string | null = null;
      const pollInterval = 3000; // 轮询间隔3秒

      // 无限轮询，直到获取到token或浏览器被关闭
      while (true) {
        // 检查当前URL是否仍然是目标URL
        const currentUrl = page.url();
        if (currentUrl !== this.TOKEN_URL) {
          logger.warn('URL已变化，可能用户未登录或被重定向');
          // 继续轮询，等待用户可能的手动登录操作
        } else {
          try {
            // 尝试从页面中获取token
            token = await page.evaluate(() => {
              // 使用确切的元素信息构造选择器
              const textarea = document.querySelector('textarea.el-textarea__inner[placeholder="SSO Token 将在这里显示"]') as HTMLTextAreaElement;

              if (textarea && textarea.value) {
                return textarea.value.trim();
              }

              return null;
            });

            if (token) {
              logger.info('成功从页面获取到token');
              // 保存获取到的token
              this.saveToken(token);
              break;
            }
          } catch (error) {
            logger.warn('本次尝试获取token失败');
          }
        }

        // 等待一段时间后再次尝试
        logger.info('等待下一次轮询...');
        await page.waitForTimeout(pollInterval);
      }

      return token;
    } catch (error) {
      logger.error({ error }, '打开浏览器获取token失败');
      return null;
    } finally {
      // 操作完成后关闭浏览器上下文
      if (context) {
        await context.close();
        logger.info('浏览器上下文已关闭');
      }
    }
  }

  /**
   * 清除保存的浏览器会话数据
   * @returns Promise<boolean> 操作是否成功
   */
  public async clearBrowserSession(): Promise<boolean> {
    try {
      if (fs.existsSync(this.userDataDirPath)) {
        logger.info('正在删除浏览器会话数据');

        // 递归删除目录
        fs.rmSync(this.userDataDirPath, { recursive: true, force: true });

        // 重新创建空目录
        fs.mkdirSync(this.userDataDirPath, { recursive: true });

        logger.info('浏览器会话数据已清除');
        return true;
      }
      return false;
    } catch (error) {
      logger.error({ error }, '清除浏览器会话数据失败');
      return false;
    }
  }

  /**
   * 保存token到文件
   * @param token 要保存的token字符串
   * @returns boolean 是否保存成功
   */
  public saveToken(token: string): boolean {
    try {
      fs.writeFileSync(this.tokenFilePath, token.trim(), 'utf-8');
      logger.info('Token已成功保存');
      return true;
    } catch (error) {
      logger.error({ error }, '保存token失败');
      return false;
    }
  }
}

// 导出TokenManager实例，方便直接使用
export const tokenManager = new TokenManager(); 