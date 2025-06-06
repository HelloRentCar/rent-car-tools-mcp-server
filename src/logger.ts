/**
 * @author Shi Chenxi (AI generated)
 */
import pino from 'pino';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

// 确保.hellobike目录存在
const homeDir = os.homedir();
const hellobikeDirPath = path.join(homeDir, '.hellobike');
if (!fs.existsSync(hellobikeDirPath)) {
  fs.mkdirSync(hellobikeDirPath, { recursive: true });
}

// 日志文件路径
const logFilePath = path.join(hellobikeDirPath, 'app.log');

// 控制台输出开关
let enableConsoleOutput: boolean = false;

// 文件日志实例 - 使用美化格式写入文件
const fileLogger = pino.default({ 
  level: 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      destination: logFilePath,  // 直接指定输出文件
      mkdir: true,               // 确保目录存在
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
      colorize: false            // 文件中不需要颜色
    }
  }
});

// 控制台日志实例 - 带颜色的美化输出
const consoleLogger = pino.default({
  level: 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,            // 控制台启用颜色
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
  }
  }
});

// 创建最终的日志记录器
const logger = {
  trace: (msg: string | object, ...args: any[]) => {
    fileLogger.trace(msg, ...args);
    if (enableConsoleOutput) consoleLogger.trace(msg, ...args);
  },
  debug: (msg: string | object, ...args: any[]) => {
    fileLogger.debug(msg, ...args);
    if (enableConsoleOutput) consoleLogger.debug(msg, ...args);
  },
  info: (msg: string | object, ...args: any[]) => {
    fileLogger.info(msg, ...args);
    if (enableConsoleOutput) consoleLogger.info(msg, ...args);
  },
  warn: (msg: string | object, ...args: any[]) => {
    fileLogger.warn(msg, ...args);
    if (enableConsoleOutput) consoleLogger.warn(msg, ...args);
  },
  error: (msg: string | object, ...args: any[]) => {
    fileLogger.error(msg, ...args);
    if (enableConsoleOutput) consoleLogger.error(msg, ...args);
  },
  fatal: (msg: string | object, ...args: any[]) => {
    fileLogger.fatal(msg, ...args);
    if (enableConsoleOutput) consoleLogger.fatal(msg, ...args);
  }
};

/**
 * 切换日志输出到控制台的状态
 * @param enable 是否启用控制台输出
 * @returns 切换后的状态
 */
export function toggleConsoleOutput(enable?: boolean): boolean {
  if (enable !== undefined) {
    enableConsoleOutput = enable;
  } else {
    enableConsoleOutput = !enableConsoleOutput;
  }
  
  return enableConsoleOutput;
}

export { logger }; 