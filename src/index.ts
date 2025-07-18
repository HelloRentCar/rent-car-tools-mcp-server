#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { startServer } from "./server.js";
import { registerRentCarsTool } from "./tools/index.js";
import { dbInitializer } from "./database/init.js";
import { getUbt } from './common/ubt.js';

// 获取当前模块的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取package.json
let packageInfo: { name: string; version: string };
try {
    const packagePath = join(__dirname, '..', 'package.json');
    const packageContent = readFileSync(packagePath, 'utf-8');
    packageInfo = JSON.parse(packageContent);
} catch (error) {
    // 如果读取失败，使用默认值
    packageInfo = {
        name: '@hb/rent-car-tools-mcp-server',
        version: '1.0.0-beta.19'
    };
}

// 主函数
async function main() {
    try {
        getUbt({
            pointId: 'mcp_rent_start_all',
        });
        // 初始化数据库
        console.log('正在初始化数据库...');
        await dbInitializer.initialize();

        // 获取数据库状态
        const dbStatus = await dbInitializer.getStatus();
        console.log('数据库状态:', dbStatus);

        const server = new Server({
            name: packageInfo.name,
            version: packageInfo.version,
        }, {
            capabilities: {
                tools: {},
            },
        });

        // 注册工具
        registerRentCarsTool(server);

        // 启动服务
        await startServer(server);
        getUbt({
            pointId: 'mcp_rent_start_success',
        });

    } catch (error) {
        getUbt({
            pointId: 'mcp_rent_start_error',
        });
        console.error('服务启动失败:', error);
        process.exit(1);
    }
}

// 优雅关闭处理
process.on('SIGINT', () => {
    console.log('正在关闭服务...');
    dbInitializer.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('正在关闭服务...');
    dbInitializer.close();
    process.exit(0);
});

// 启动应用
main(); 