import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
/**
 * 以stdio模式启动MCP服务器
 * @param server MCP服务器实例
 */
async function startStdioMode(server) {
    console.error("stdio模式已启动！");
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("RentCars Tool MCP Server running on stdio");
}
/**
 * 启动MCP服务器
 * @param server MCP服务器实例
 */
export async function startServer(server) {
    // const isStdioMode = process.env.NODE_ENV === "cli" || process.argv.includes("--stdio");
    // const isSSEMode = process.env.NODE_ENV === "sse" || process.argv.includes("--sse");
    try {
        await startStdioMode(server);
    }
    catch (error) {
        console.error("Fail error running server:", error);
        process.exit(1);
    }
}
