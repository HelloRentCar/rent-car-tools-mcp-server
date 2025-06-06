/**
 * @author Shi Chenxi (AI generated)
 */
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { tokenManager } from "../token-manager.js";
// import { logger } from "../logger.js";

/**
 * 注册SSO工具
 * 此工具用于获取和管理SSO Token
 * @param server MCP服务器实例
 */
export function registerSSOTool(server: McpServer) {
  // 获取Token工具
  server.tool(
    "get_sso_token",
    "获取SSO Token。如果本地已有Token则直接返回，否则会打开浏览器引导用户登录获取Token。",
    {
      refresh: z.boolean().default(false).describe("是否强制刷新Token，true表示强制打开浏览器重新获取")
    },
    async ({ refresh }) => {
      // logger.info(`获取SSO Token，强制刷新: ${refresh}`);
      
      let token = null;
      
      if (refresh) {
        // 如果需要强制刷新，直接打开浏览器获取
        // logger.info('需要刷新Token，将打开浏览器获取');
        token = await tokenManager.openBrowserForToken();
      } else {
        // 否则使用getToken方法自动处理
        token = await tokenManager.getToken();
      }
      
      if (token) {
        return {
          content: [{
            type: "text",
            text: token
          }]
        };
      } else {
        return {
          content: [{
            type: "text",
            text: "获取SSO Token失败，请稍后重试或手动登录获取"
          }]
        };
      }
    }
  );
} 