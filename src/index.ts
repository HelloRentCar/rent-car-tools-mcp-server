#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { startServer } from "./server.js";
import { registerRentCarsTool } from "./tools/index.js";

// 获取当前模块的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取package.json
let packageInfo;
try {
    const packagePath = join(__dirname, '..', 'package.json');
    const packageContent = readFileSync(packagePath, 'utf-8');
    packageInfo = JSON.parse(packageContent);
} catch (error) {
  // 如果读取失败，使用默认值
    packageInfo = {
        name: '@hb/rent-car-tools-mcp-server',
        version: '1.0.0-beta.5'
    };
}
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

//启动服务
await startServer(server); 