# @hb/rent-car-tools-mcp-server

租车工具MCP项目，基于Model Context Protocol SDK。


## 一、开发说明

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建项目
```bash
npm run build
```

### 启动服务
```bash
npm start
```


## 二、自定义MCP工具

1. 在 `src/tools` 目录创建新的工具文件
2. 在 `src/index.ts` 中引入并注册新工具


## 三、配置 MCP Server

```json
{
  "mcpServers": {
    "rent-car-tools-mcp-server": {
      "command": "npx",
      "args":[
        "--registry=http://nodepackages.hellobike.cn:4873/", 
        "@hb/rent-car-tools-mcp-server@latest"
      ],
    }
  }
}
```