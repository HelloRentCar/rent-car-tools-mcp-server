import QRCode from 'qrcode';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { insertVehicles } from './sqlite.js';
import { handleSearchListV3, SEARCHCARLISTV3_TOOL } from './rentCar/searchCarListPageV3.js';
// import * as eventsTool from './events.js';
import { handleVehicleMorePriceListV3, VEHICLEMOREPRICELISTV3_TOOL } from './rentCar/vehicleMorePriceListV3.js';
import * as AmapTool from './amap/index.js';


const ORDER_URL_LINK_TOOL = {
  name: "order_url_link",
  description: "根据用户输入的车型ID（字段为vehicleDisplayGroupId），返回的下单URL，需要以二维码图片的形式进行展示便于用户扫码操作",
  inputSchema: {
    type: "object",
    properties: {
      vehicleDisplayGroupId: {
        type: "string",
        description: "聚合组ID，来源于 MCP工具 search_carList_page_v3 接口返回的车辆数据中vehicles字段中的vehicleDisplayGroupId"
      }
    }
  }
}

const RENT_CAR_TOOLS: any[] = [
  ORDER_URL_LINK_TOOL,
  SEARCHCARLISTV3_TOOL,
  VEHICLEMOREPRICELISTV3_TOOL
];




export function registerRentCarsTool(server: Server) {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      ...RENT_CAR_TOOLS,
      ...AmapTool.MAPS_TOOLS,
      // ...eventsTool.EVENTS_TOOLS
    ],
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
          // 将数据写入数据库
          if (!result.isError) {
            try {
              await insertVehicles({
                requestId: result?.content?.[0]?.requestId || '',
                vehicles: JSON.stringify({
                  requestId: result?.content?.[0]?.requestId || '',
                  sessionId: request.sessionId || '',
                  // 获取当前会话id
                  vehicleList: result?.content?.[0]?.data || [],
                }, null, 2),
              });
              result.content.push({
                type: "text",
                text: `数据已保存到本地数据库`,
                requestId: result?.content?.[0]?.requestId || '',
                data: [],
              });
            } catch (err) {
              console.error('写入数据库失败:', err);
              result.content.push({
                type: "text",
                text: `写入数据库失败: ${err instanceof Error ? err.message : String(err)}`,
                requestId: result?.content?.[0]?.requestId || '',
                data: [],
              });
            }
            result.content.push({
              type: "text",
              text: `询价成功: ${JSON.stringify(result?.content?.[0]?.data || [])}`,
              requestId: result?.content?.[0]?.requestId || '',
              data: [],
            });
          }
          return result;
        }
        case "vehicle_more_price_list_v3": {
          const { pickupRentalInfo, dropoffRentalInfo, groupCode, vehicleDisplayGroupId } = request.params.arguments;
          const result = await handleVehicleMorePriceListV3(pickupRentalInfo, dropoffRentalInfo, groupCode, vehicleDisplayGroupId);
          if (!result.isError) {
            result.content.push({
              type: "text",
              text: `该车型下更多供应商报价查询识别: ${JSON.stringify(result?.content?.[0]?.data || [])}`,
              requestId: result?.content?.[0]?.requestId || '',
              data: [],
            });
          }
          return result;
        }
        case "maps_regeocode": {
            const { location } = request.params.arguments;
            return await AmapTool.handleReGeocode(location);
        }
        case "maps_geo": {
            const { address, city } = request.params.arguments;
            return await AmapTool.handleGeo(address, city);
        }
        case "maps_ip_location": {
            const { ip } = request.params.arguments;
            return await AmapTool.handleIPLocation(ip);
        }
        case "maps_weather": {
            const { city } = request.params.arguments;
            return await AmapTool.handleWeather(city);
        }
        case "maps_search_detail": {
            const { id } = request.params.arguments;
            return await AmapTool.handleSearchDetail(id);
        }
        case "maps_bicycling": {
            const { origin, destination } = request.params.arguments;
            return await AmapTool.handleBicycling(origin, destination);
        }
        case "maps_direction_walking": {
            const { origin, destination } = request.params.arguments;
            return await AmapTool.handleWalking(origin, destination);
        }
        case "maps_direction_driving": {
            const { origin, destination } = request.params.arguments;
            return await AmapTool.handleDriving(origin, destination);
        }
        case "maps_direction_transit_integrated": {
            const { origin, destination, city, cityd } = request.params.arguments;
            return await AmapTool.handleTransitIntegrated(origin, destination, city, cityd);
        }
        case "maps_distance": {
            const { origins, destination, type } = request.params.arguments;
            return await AmapTool.handleDistance(origins, destination, type);
        }
        case "maps_text_search": {
            const { keywords, city, citylimit } = request.params.arguments;
            return await AmapTool.handleTextSearch(keywords, city, citylimit);
        }
        case "maps_around_search": {
            const { location, radius, keywords } = request.params.arguments;
            return await AmapTool.handleAroundSearch(location, radius, keywords);
        }
        // case "search_events": {
        //   return { content: [{ type: "json", data: await eventsTool.searchEvents(request.params.arguments) }], isError: false };
        // }
        // case "get_event_details": {
        //   return { content: [{ type: "json", data: await eventsTool.getEventDetails(request.params.arguments.searchId) }], isError: false };
        // }
        // case "filter_events_by_date": {
        //   return { content: [{ type: "json", data: await eventsTool.filterEventsByDate(request.params.arguments.searchId, request.params.arguments.date_range, request.params.arguments.specific_date) }], isError: false };
        // }
        // case "filter_events_by_type": {
        //   return { content: [{ type: "json", data: await eventsTool.filterEventsByType(request.params.arguments.searchId, request.params.arguments.event_types) }], isError: false };
        // }
        // case "filter_events_by_venue": {
        //   return { content: [{ type: "json", data: await eventsTool.filterEventsByVenue(request.params.arguments.searchId, request.params.arguments.venue_names) }], isError: false };
        // }
        // case "get_event_searches": {
        //   return { content: [{ type: "markdown", text: await eventsTool.getEventSearches() }], isError: false };
        // }
        // case "get_event_search_details": {
        //   return { content: [{ type: "markdown", text: await eventsTool.getEventSearchDetails(request.params.arguments.searchId) }], isError: false };
        // }
        // case "event_discovery_prompt": {
        //   return { content: [{ type: "markdown", text: eventsTool.eventDiscoveryPrompt(request.params.arguments) }], isError: false };
        // }
        // case "event_comparison_prompt": {
        //   return { content: [{ type: "markdown", text: eventsTool.eventComparisonPrompt(request.params.arguments.searchId) }], isError: false };
        // }
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