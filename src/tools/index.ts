
// import { z } from "zod";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
// import { mockData } from './mock'

async function getFetch() {
  // Node.js 18+ 有内置的 fetch
  if (typeof globalThis.fetch !== 'undefined') {
    return globalThis.fetch;
  }
  
  // Node.js 16 需要使用 node-fetch
  try {
    const { default: fetch } = await import('node-fetch');
    return fetch as any;
  } catch (error) {
    throw new Error('请安装 node-fetch: npm install node-fetch');
  }
}
const SEARCHCARLISTV3_TOOL = {
  name: "search_carList_page_v3",
  description: "用户根据预期的取车时间和还车时间，地点查询可预约车辆商品数据",
  inputSchema: {
    type: "object",
    properties: {
      pickupRentalInfo: {
        type: "object",
        properties: {
          latitude: {
            type: "string",
            description: "取车纬度, 根据用户输入的取车地址转换成对应的纬度"
          },
          longitude: {
            type: "string",
            description: "取车经度, 根据用户输入的取车地址转换成对应的经度"
          },
          cityCode: {
            type: "string",
            description: "取车城市区号, 如: 021"
          },
          dateTime: {
            type: "number",
            description: '取车时间毫秒戳, 如: 1747994400000'
          },
        },
        required: ["latitude", 'longitude', 'cityCode', 'dateTime']
      },
      dropoffRentalInfo: {
        type: "object",
        properties: {
          latitude: {
            type: "string",
            description: "还车纬度, 根据用户输入的取车地址转换成对应的纬度, 如: 31.235993"
          },
          longitude: {
            type: "string",
            description: "还车经度, 根据用户输入的取车地址转换成对应的经度, 如: 121.480168"
          },
          cityCode: {
            type: "string",
            description: "取车城市区号, 如: 021"
          },
          dateTime: {
            type: "number",
            description: '取车时间毫秒戳, 如: 1747994400000'
          },
        },
        required: ["latitude", 'longitude', 'cityCode', 'dateTime']
      }
    },
    required: ["pickupRentalInfo", "dropoffRentalInfo"]
  }
};
const MAPS_TOOLS: any[] = [
  SEARCHCARLISTV3_TOOL,
];

async function handleSearchListV3(pickupRentalInfo: any, dropoffRentalInfo: any) {
  const fetch = await getFetch();
  const reqJson = {
    "action": "veh.search.page.v3",
    "pickupRentalInfo": {
      "cityCode": pickupRentalInfo?.cityCode || '021', 
      "latitude": pickupRentalInfo?.latitude || '31.23136', 
      "longitude": pickupRentalInfo?.longitude || '121.47004', 
      "datetime": new Date(pickupRentalInfo?.dateTime).getTime()
    }, 
    "dropoffRentalInfo": {
        "cityCode": dropoffRentalInfo?.cityCode || '021', 
        "latitude": dropoffRentalInfo?.latitude || '31.23136', 
        "longitude": dropoffRentalInfo?.longitude || '121.47004', 
        "datetime": new Date(dropoffRentalInfo?.dateTime).getTime()
    }, 
    "pageIndex": 1, 
    "pageSize": 500, 
  }
  // url.searchParams.append("location", location);
  // // url.searchParams.append("key", AMAP_MAPS_API_KEY);
  // url.searchParams.append("source", "ts_mcp");
  const response = await fetch('https://a.hellobike.com/rent/api?veh.search.page.v3', {
    method: "POST",
    body: reqJson,
    headers: {
      "Content-Type": "application/json"
    }
  });
  console.error("询价running-response...", response)
  const data = await response.json();
  console.error("询价running-reqJson...", reqJson)
  console.error("询价running-data...", data)

  if (data?.code && +data?.code === 0) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify(data?.data?.vehicles)
      }],
      isError: false
    };
  }
  
  return {
    content: [{
      type: "text",
      text: `询价查询识别: ${data?.msg}`
    }],
    isError: true
  };
}


export function registerRentCarsTool(server: Server) {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: MAPS_TOOLS,
  }));
  // 获取Token工具
  server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
    try {
      switch (request.params.name) {
        case "search_carList_page_v3": {
          const { pickupRentalInfo, dropoffRentalInfo} = request.params.arguments;
          return await handleSearchListV3(pickupRentalInfo, dropoffRentalInfo);
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