
// import { z } from "zod";
import path, { dirname }  from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { ResponseResult } from "../types/index";
import { ICarInfo } from "../types/searchPage";
// import { mockData } from './mock'
// 获取当前模块的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
            description: "取车纬度, 根据用户输入的取车地址转换成对应的纬度, 如: 上海市人民广场的经度是31.23356"
          },
          longitude: {
            type: "string",
            description: "取车经度, 根据用户输入的取车地址转换成对应的经度, 如: 上海市人民广场的纬度是121.475914"
          },
          cityCode: {
            type: "string",
            description: "取车城市区号, 如: 021"
          },
          datetime: {
            type: "number",
            description: '取车时间毫秒戳, 如: 用户取车时间为2025年06日18日下午四点, 毫秒戳为1750233600000'
          },
        },
        required: ["latitude", 'longitude', 'cityCode', 'datetime']
      },
      dropoffRentalInfo: {
        type: "object",
        properties: {
          latitude: {
            type: "string",
            description: "还车纬度, 根据用户输入的取车地址转换成对应的纬度, 如: 上海市人民广场的经度是31.233568"
          },
          longitude: {
            type: "string",
            description: "还车经度, 根据用户输入的取车地址转换成对应的经度, 如: 上海市人民广场的纬度是121.475914"
          },
          cityCode: {
            type: "string",
            description: "还车城市区号, 如: 上海市为021"
          },
          datetime: {
            type: "number",
            description: '还车时间毫秒戳, 如: 用户还车时间为2025年06日20日下午四点, 毫秒戳为1747994400000'
          },
        },
        required: ["latitude", 'longitude', 'cityCode', 'datetime']
      }
    },
    required: ["pickupRentalInfo", "dropoffRentalInfo"]
  },
  outputSchema: {
    type: "object",
    properties: {
      code: {
        type: "number",
        description: "响应状态码，0表示成功"
      },
      msg: {
        type: "string",
        description: "响应消息"
      },
      data: {
        type: "object",
        properties: {
          groupName: {
            type: "string",
            description: "分组名称"
          },
          groupCode: {
            type: "string",
            description: "分组代码"
          },
          vehicles: {
            type: "array",
            description: "车型列表",
            items: {
              type: "object",
              properties: {
                vehicleTerms: {
                  type: "string",
                  description: "车型标签"
                },
                storeTerms: {
                  type: "array",
                  description: "门店标签",
                  items: {
                    type: "object",
                    properties: {
                      termCode: { type: "string", description: "标签code" },
                      termType: { type: "string", description: "标签类型" },
                      termName: { type: "string", description: "标签名称" },
                      labelUrls: { 
                        type: "array", 
                        description: "标签图片",
                        items: {
                          type: "object",
                          properties: {
                            url: { type: "string", description: "图片URL地址" }
                          }
                        }
                      }
                    }
                  }
                },
                priceTotalNum: { type: "string", description: "报价数量" },
                vehicleTotalNum: { type: "number", description: "子车型数量" },
                minPriceSupplier: {
                  type: "object",
                  description: "最低报价信息",
                  properties: {
                    totalPrice: { type: "number", description: "总价" },
                    dailyPrice: { type: "string", description: "日均价" },
                    pickupType: { type: "string", description: "取车方式" },
                    dropoffType: { type: "string", description: "还车方式" }
                  }
                },
                firstPriceSupplier: {
                  type: "object",
                  description: "最先报价信息",
                  properties: {
                    totalPrice: { type: "number", description: "总价" },
                    dailyPrice: { type: "string", description: "日均价" },
                    pickupType: { type: "string", description: "取车方式" },
                    dropoffType: { type: "string", description: "还车方式" }
                  }
                },
                vehicleName: { type: "string", description: "聚合组名称" },
                brandName: { type: "string", description: "品牌名" },
                displacement: { type: "string", description: "排量，如'1.5L'" },
                transmissionName: { type: "string", description: "自动或手动" },
                passengerNo: { type: "string", description: "座位数" },
                fuelTypeName: { type: "string", description: "燃油类型名称" },
                doorNo: { type: "string", description: "车门数" },
                licenseType: { type: "string", description: "车牌类型，如'蓝牌'" },
                licenseTag: { type: "string", description: "牌照" },
                needShowHelloBrand: { type: "boolean", description: "是否显示哈啰品牌店 banner" },
                needShowSelfBrand: { type: "boolean", description: "是否显示哈啰自营 banner" },
                fromSplit: { type: "boolean", description: "是否源自拆分" },
                isShowRemand: { type: "boolean", description: "是否显示免押提示弹窗" },
                shoppingGuideMsg: { type: "string", description: "车型导购语" },
                locationSourceType: { type: "number", description: "0：固定位；1：普通算法排序" },
                enterpriseInfo: { type: "array", description: "政企员工报价信息" },
                mobileImgUrl: { type: "string", description: "车型图片" }
              }
            }
          },
          totalVehicleNum: {
            type: "number",
            description: "车型总数"
          },
        },
        required: ["vehicles", "totalVehicleNum"]
      }
    },
    required: ["code", "msg", "data"]
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
      "datetime": pickupRentalInfo?.datetime
    }, 
    "dropoffRentalInfo": {
        "cityCode": dropoffRentalInfo?.cityCode || '021', 
        "latitude": dropoffRentalInfo?.latitude || '31.23136', 
        "longitude": dropoffRentalInfo?.longitude || '121.47004', 
        "datetime": dropoffRentalInfo?.datetime
    }, 
    "pageIndex": 1, 
    "pageSize": 100, 
  }
  // url.searchParams.append("location", location);
  // // url.searchParams.append("key", AMAP_MAPS_API_KEY);
  // url.searchParams.append("source", "ts_mcp");
  const response = await fetch('https://a.hellobike.com/rent/api?veh.search.page.v3', {
    method: "POST",
    body: JSON.stringify(reqJson),
    headers: {
      "Content-Type": "application/json"
    }
  });
  const data: ResponseResult<ICarInfo> = await response.json();
  if (+data?.code === 0) {
    return {
      content: [{
        type: "text",
        text: `数据处理中...`,
        data: data?.data?.vehicles || [],
      }],
      isError: false
    };
  }
  
  return {
    content: [{
      type: "text",
      text: `询价查询识别：${data?.msg}`
    }],
    isError: true
  };
}

// 车型数据分析函数
function analyzeCarData(data: any) {
  // 这里实现车型数据与用户需求的匹配逻辑
  // 例如：分析价格区间、车型大小、品牌偏好等
  
  if (!data || data.isError) {
    return "无有效数据可分析";
  }
  
  try {
    const carList = data?.content?.[0]?.data|| [];
    
    if (carList?.length === 0) {
      return "未找到符合条件的车辆";
    }
    
    // 按价格排序
    const sortedByPrice = [...carList].sort((a: any, b: any) => 
      (a.totalAmount || 0) - (b.totalAmount || 0)
    );
    
    // 获取价格区间
    const priceRange = {
      lowest: sortedByPrice[0]?.totalAmount || 0,
      highest: sortedByPrice[sortedByPrice.length - 1]?.totalAmount || 0,
      average: sortedByPrice.reduce((sum: number, car: any) => sum + (car.totalAmount || 0), 0) / sortedByPrice.length
    };
    
    // 车型分类统计
    const carTypeCount: Record<string, number> = {};
    carList.forEach((car: any) => {
      const carType = car.carType || '未知';
      carTypeCount[carType] = (carTypeCount[carType] || 0) + 1;
    });
    
    return `找到${carList.length}辆符合条件的车辆。价格区间：¥${priceRange.lowest.toFixed(2)}-¥${priceRange.highest.toFixed(2)}，平均价格：¥${priceRange.average.toFixed(2)}。车型分布：${Object.entries(carTypeCount).map(([type, count]) => `${type}(${count}辆)`).join('、')}`;
  } catch (error) {
    console.error('分析车型数据时出错:', error);
    return "分析车型数据时出现错误";
  }
}


export function registerRentCarsTool(server: Server) {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: MAPS_TOOLS,
  }));
  // 获取Token工具
  server.setRequestHandler(CallToolRequestSchema,  async (request: any) => {
    try {
      switch (request.params.name) {
        case "search_carList_page_v3": {
          let resultAll: any = [];
          const { pickupRentalInfo, dropoffRentalInfo } = request.params.arguments;
          const result = await handleSearchListV3(pickupRentalInfo, dropoffRentalInfo);
          // 将数据写入临时文件
          const tempFilePath = path.join(__dirname, '../temp/carListData.json');
          
          try {
            // 确保目录存在
            const tempDir = path.dirname(tempFilePath);
            if (!fs.existsSync(tempDir)) {
              fs.mkdirSync(tempDir, { recursive: true });
            }
            
            // 写入数据到临时文件
            fs.writeFileSync(tempFilePath, JSON.stringify(result, null, 2));
            
            // 添加文件路径信息到返回结果
            if (!result.isError) {
              result.content.push({
                type: "text",
                text: `数据已保存到临时文件: ${tempFilePath}`,
                data: [],
              });
            }
          } catch (err) {
            console.error('写入临时文件失败:', err);
          }
          // 添加数据分析逻辑
          if (!result.isError && result.content) {
            try {
              // 读取临时文件中的数据进行分析
              const tempFilePath = path.join(__dirname, `../temp/carListData.json?${Date.now()}`);
              
              if (fs.existsSync(tempFilePath)) {
                const carListData = JSON.parse(fs.readFileSync(tempFilePath, 'utf8'));
                
                // 分析车型数据是否匹配用户需求
                const analysisResult = analyzeCarData(carListData);
                // 将分析结果添加到返回内容中
                result.content.push({
                  type: "text",
                  data: [],
                  text: `车型数据分析结果: ${analysisResult}`
                });
              }
            } catch (err) {
              console.error('数据分析失败:', err);
              result.content.push({
                type: "text",
                data: [],
                text: `数据分析过程中出现错误: ${err instanceof Error ? err.message : String(err)}`
              });
            }
          }
          return result;
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