// import { z } from "zod";
// import path, { dirname } from 'path';
// import * as fs from 'fs';
// import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { insertVehicles } from './sqlite.js';
import { handleSearchListV3, SEARCHCARLISTV3_TOOL } from './searchCarListPageV3.js';
import * as eventsTool from './events.js';
// 获取当前模块的目录
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);


const ORDER_URL_LINK_TOOL = {
  name: "order_url_link",
  description: "根据用户输入的车型ID（字段为vehicleDisplayGroupId），返回的下单URL，需要以二维码图片的形式进行展示便于用户扫码操作",
  inputSchema: {
    type: "object",
    properties: {
      vehicleDisplayGroupId: {
        type: "string",
        description: "车型ID，来源于 MCP工具 search_carList_page_v3 返回的minPriceSupplier.vehicleInfo.vehicleDisplayGroupId"
      }
    }
  }
}

const MAPS_TOOLS: any[] = [
  SEARCHCARLISTV3_TOOL,
  ORDER_URL_LINK_TOOL
];

const EVENTS_TOOLS = [
  {
    name: "search_events",
    description: "搜索活动事件，支持关键词、地点、时间、类型等过滤。",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "搜索关键词" },
        location: { type: "string", description: "地点，可选" },
        date_filter: { type: "string", description: "时间过滤，可选" },
        event_type: { type: "string", description: "事件类型，可选" },
        language: { type: "string", description: "语言代码，可选，默认en" },
        country: { type: "string", description: "国家代码，可选，默认us" },
        max_results: { type: "number", description: "最大返回数量，可选，默认20" }
      }
    }
  },
  {
    name: "get_event_details",
    description: "获取指定搜索ID的事件详情。",
    inputSchema: {
      type: "object",
      properties: {
        searchId: { type: "string", description: "事件搜索ID" }
      }
    }
  },
  {
    name: "filter_events_by_date",
    description: "按日期范围或具体日期过滤事件。",
    inputSchema: {
      type: "object",
      properties: {
        searchId: { type: "string", description: "事件搜索ID" },
        date_range: { type: "string", description: "日期范围，如today、week等，可选" },
        specific_date: { type: "string", description: "具体日期YYYY-MM-DD，可选" }
      }
    }
  },
  {
    name: "filter_events_by_type",
    description: "按类型过滤事件。",
    inputSchema: {
      type: "object",
      properties: {
        searchId: { type: "string", description: "事件搜索ID" },
        event_types: { type: "array", items: { type: "string" }, description: "事件类型数组" }
      }
    }
  },
  {
    name: "filter_events_by_venue",
    description: "按场馆名称过滤事件。",
    inputSchema: {
      type: "object",
      properties: {
        searchId: { type: "string", description: "事件搜索ID" },
        venue_names: { type: "array", items: { type: "string" }, description: "场馆名称数组" }
      }
    }
  },
  {
    name: "get_event_searches",
    description: "获取所有已保存的事件搜索列表。",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "get_event_search_details",
    description: "获取指定搜索ID的详细事件搜索信息（markdown格式）。",
    inputSchema: {
      type: "object",
      properties: {
        searchId: { type: "string", description: "事件搜索ID" }
      }
    }
  },
  {
    name: "event_discovery_prompt",
    description: "生成事件发现的AI提示词。",
    inputSchema: {
      type: "object",
      properties: {
        location: { type: "string" },
        interests: { type: "string" },
        date_preference: { type: "string" },
        event_type: { type: "string" },
        budget: { type: "string" }
      }
    }
  },
  {
    name: "event_comparison_prompt",
    description: "生成事件对比分析的AI提示词。",
    inputSchema: {
      type: "object",
      properties: {
        searchId: { type: "string" }
      }
    }
  }
];


export function registerRentCarsTool(server: Server) {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [...MAPS_TOOLS, ...EVENTS_TOOLS],
  }));
  // 获取Token工具
  server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
    try {
      switch (request.params.name) {
        case "order_url_link": {
          const { vehicleDisplayGroupId } = request.params.arguments;
          try {
            //方案一：动态生成二维码
            const url = "https://m.hellobike.com/rentcarstore";
            const qrCode = await QRCode.toDataURL(url);
            // 移除 data:image/png;base64, 前缀，只保留纯base64数据
            const base64Data = qrCode.split(',')[1];
            return {
              content: [{
                type: "image",
                data: base64Data,
                mimeType: 'image/png'
              },
              ],
              isError: false
            };

            // // 方案二：使用本地静态图片作为回退
            // const imagePath = path.join(__dirname, "../../order_link2.png");

            // if (fs.existsSync(imagePath)) {
            //   const imageBuffer = fs.readFileSync(imagePath);
            //   const base64Image = imageBuffer.toString('base64');

            //   return {
            //     content: [{
            //       type: "image",
            //       data: base64Image,
            //       mimeType: 'image/png'
            //     },
            //     {
            //       type: "text",
            //       text: "下单链接:https://m.hellobike.com/resource/gallery/971/1Iv7i2nM_https___m.hellobike.com_rentcarstore.png?x-oss-process=image/quality,q_80"
            //     }],
            //     isError: false
            //   };
            // }

            // 方案三：使用远程URL作为最后的回退
            // return {
            //   content: [{
            //     type: "image",
            //     url: "https://m.hellobike.com/resource/gallery/971/1Iv7i2nM_https___m.hellobike.com_rentcarstore.png?x-oss-process=image/quality,q_80"
            //   }],
            //   isError: false
            // };

          } catch (error) {
            console.error('生成二维码失败:', error);
            return {
              content: [{
                type: "text",
                text: `生成二维码失败: ${error instanceof Error ? error.message : String(error)}`
              }],
              isError: true
            };
          }
        }
        case "search_carList_page_v3": {
          const { pickupRentalInfo, dropoffRentalInfo, filter = [] } = request.params.arguments;
          const result = await handleSearchListV3(pickupRentalInfo, dropoffRentalInfo, filter);
          // 将数据写入临时文件
          if (result?.code !== 0) {
            return {
              content: [{
                type: "text",
                text: `询价查询失败: ${result?.msg}`,
                requestId: result?.data?.requestId || '',
              }],
              isError: true
            };
          }
          // 将数据写入数据库
          try {
            insertVehicles({
              requestId: result?.data?.requestId || '',
              vehicles: JSON.stringify({
                vehicles: result?.data?.vehicles,
              }, null, 2),
            });
          } catch (err) {
            console.error('写入数据库失败:', err);
          }
          return {
            content: [{
              type: "text",
              text: JSON.stringify(result?.data?.vehicles || [])
            }],
            isError: false
          };

        }
        case "search_events": {
          return { content: [{ type: "json", data: await eventsTool.searchEvents(request.params.arguments) }], isError: false };
        }
        case "get_event_details": {
          return { content: [{ type: "json", data: await eventsTool.getEventDetails(request.params.arguments.searchId) }], isError: false };
        }
        case "filter_events_by_date": {
          return { content: [{ type: "json", data: await eventsTool.filterEventsByDate(request.params.arguments.searchId, request.params.arguments.date_range, request.params.arguments.specific_date) }], isError: false };
        }
        case "filter_events_by_type": {
          return { content: [{ type: "json", data: await eventsTool.filterEventsByType(request.params.arguments.searchId, request.params.arguments.event_types) }], isError: false };
        }
        case "filter_events_by_venue": {
          return { content: [{ type: "json", data: await eventsTool.filterEventsByVenue(request.params.arguments.searchId, request.params.arguments.venue_names) }], isError: false };
        }
        case "get_event_searches": {
          return { content: [{ type: "markdown", text: await eventsTool.getEventSearches() }], isError: false };
        }
        case "get_event_search_details": {
          return { content: [{ type: "markdown", text: await eventsTool.getEventSearchDetails(request.params.arguments.searchId) }], isError: false };
        }
        case "event_discovery_prompt": {
          return { content: [{ type: "markdown", text: eventsTool.eventDiscoveryPrompt(request.params.arguments) }], isError: false };
        }
        case "event_comparison_prompt": {
          return { content: [{ type: "markdown", text: eventsTool.eventComparisonPrompt(request.params.arguments.searchId) }], isError: false };
        }
        default:
          return {
            content: [{
              type: "text",
              text: `Unknown tool: ${request.params.name}`
            }],
            isError: true
          };
      }
    }
    catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  });
} 