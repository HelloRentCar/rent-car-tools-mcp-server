import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { insertVehicles } from './sqlite.js';
import { handleSearchListV3, SEARCHCARLISTV3_TOOL } from './rentCar/searchCarListPageV3.js';
import { handleOrderUrlLink, MORE_PRICE_URL_LINK_TOOL } from './rentCar/vehiceMorePriceUrlLink.js';
import { handleVehicleMorePriceListV3, VEHICLEMOREPRICELISTV3_TOOL } from './rentCar/vehicleMorePriceListV3.js';

// import * as eventsTool from './events.js';
import * as AmapTool from './amap/index.js';


const RENT_CAR_TOOLS: any[] = [
  SEARCHCARLISTV3_TOOL,
  VEHICLEMOREPRICELISTV3_TOOL,
  MORE_PRICE_URL_LINK_TOOL,
];




export function registerRentCarsTool(server: Server) {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      ...RENT_CAR_TOOLS,
      ...(AmapTool.getApiKey() ? AmapTool.MAPS_TOOLS : []),
      // ...eventsTool.EVENTS_TOOLS
    ],
  }));
  // 获取Token工具
  server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
    try {
      switch (request.params.name) {
        case "rent_car_more_price_link": {
          const { pickupRentalInfo, dropoffRentalInfo, vehicleDisplayGroupId } = request.params.arguments;
          return await handleOrderUrlLink(pickupRentalInfo, dropoffRentalInfo, vehicleDisplayGroupId);
        }
        case "rent_car_search_carList_page_v3": {
          const { pickupRentalInfo, dropoffRentalInfo, filter = [] } = request.params.arguments;
          const result = await handleSearchListV3(pickupRentalInfo, dropoffRentalInfo, filter);
          // 将数据写入数据库
          if (!result.isError) {
            // try {
            //   await insertVehicles({
            //     requestId: result?.content?.[0]?.requestId || '',
            //     vehicles: JSON.stringify({
            //       requestId: result?.content?.[0]?.requestId || '',
            //       sessionId: request.sessionId || '',
            //       // 获取当前会话id
            //       vehicleList: result?.content?.[0]?.data || [],
            //     }, null, 2),
            //   });
            //   result.content.push({
            //     type: "text",
            //     text: `数据已保存到本地数据库`,
            //     requestId: result?.content?.[0]?.requestId || '',
            //     data: [],
            //   });
            // } catch (err) {
            //   console.error('写入数据库失败:', err);
            //   result.content.push({
            //     type: "text",
            //     text: `写入数据库失败: ${err instanceof Error ? err.message : String(err)}`,
            //     requestId: result?.content?.[0]?.requestId || '',
            //     data: [],
            //   });
            // }
            result.content.push({
              type: "text",
              text: `询价成功: ${JSON.stringify(result?.content?.[0]?.data || [])}`,
              requestId: result?.content?.[0]?.requestId || '',
              data: [],
            });
          }
          return result;
        }
        case "rent_vehicle_more_price_list_v3": {
          const { pickupRentalInfo, dropoffRentalInfo, groupCode, vehicleDisplayGroupId } = request.params.arguments;
          return await handleVehicleMorePriceListV3(pickupRentalInfo, dropoffRentalInfo, groupCode, vehicleDisplayGroupId);
        }

        // case "maps_regeocode": {
        //   const { location } = request.params.arguments;
        //   return await AmapTool.handleReGeocode(location);
        // }
        // case "maps_geo": {
        //   const { address, city } = request.params.arguments;
        //   return await AmapTool.handleGeo(address, city);
        // }
        // case "maps_ip_location": {
        //   const { ip } = request.params.arguments;
        //   return await AmapTool.handleIPLocation(ip);
        // }
        // case "maps_weather": {
        //   const { city } = request.params.arguments;
        //   return await AmapTool.handleWeather(city);
        // }
        // case "maps_search_detail": {
        //   const { id } = request.params.arguments;
        //   return await AmapTool.handleSearchDetail(id);
        // }
        // case "maps_bicycling": {
        //   const { origin, destination } = request.params.arguments;
        //   return await AmapTool.handleBicycling(origin, destination);
        // }
        // case "maps_direction_walking": {
        //   const { origin, destination } = request.params.arguments;
        //   return await AmapTool.handleWalking(origin, destination);
        // }
        // case "maps_direction_driving": {
        //   const { origin, destination } = request.params.arguments;
        //   return await AmapTool.handleDriving(origin, destination);
        // }
        // case "maps_direction_transit_integrated": {
        //   const { origin, destination, city, cityd } = request.params.arguments;
        //   return await AmapTool.handleTransitIntegrated(origin, destination, city, cityd);
        // }
        // case "maps_distance": {
        //   const { origins, destination, type } = request.params.arguments;
        //   return await AmapTool.handleDistance(origins, destination, type);
        // }
        // case "maps_text_search": {
        //   const { keywords, city, citylimit } = request.params.arguments;
        //   return await AmapTool.handleTextSearch(keywords, city, citylimit);
        // }
        // case "maps_around_search": {
        //   const { location, radius, keywords } = request.params.arguments;
        //   return await AmapTool.handleAroundSearch(location, radius, keywords);
        // }
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