import { toTimestamp } from "../../common/index.js";
import { getUbt } from "../../common/ubt.js";

/**
 * 生成以二维码图片形式的具体车辆所有供应商报价列表的链接 便于用户扫码操作
 */
export const MORE_PRICE_URL_LINK_TOOL = {
  name: "car_more_price_link",
  description: "依赖 search_carList_page_v3 工具中返回的车辆列表数据，根据用户选择车辆的聚合组ID（字段为vehicleDisplayGroupId），生成以二维码图片形式的报价页面URL便于用户扫码查看",
  inputSchema: {
    type: "object",
    properties: {
      pickupRentalInfo: {
        type: "object",
        description: "取车信息，包括取车地点、时间等详细参数。",
        properties: {
          latitude: {
            type: "string",
            description: "取车纬度, 根据用户输入的取车地址转换成对应的纬度, 如: 上海市人民广场的纬度是31.23356"
          },
          longitude: {
            type: "string",
            description: "取车经度, 根据用户输入的取车地址转换成对应的经度, 如: 上海市人民广场的经度是121.475914"
          },
          adCode: {
            type: "string",
            description: "取车行政区划编码, 如: 310101"
          },
          cityName: {
            type: "string",
            description: "取车城市名称, 如: 上海市"
          },
          cityCode: {
            type: "string",
            description: "取车城市区号, 如: 021"
          },
          dateStr: {
            type: "string",
            description: "取车日期, 如: 2025年07月20日 10:00, 如果没有年份信息默认为2025年, 取车时间大于当前时间"
          },
          locationName: {
            type: "string",
            description: "取车地点名称, 如: 上海市人民广场"
          }
        },
        required: ["latitude", "longitude", "adCode", "cityName", "cityCode", "dateStr", "locationName"]
      },
      dropoffRentalInfo: {
        type: "object",
        description: "还车信息，包括还车地点、时间等详细参数。",
        properties: {
          latitude: {
            type: "string",
            description: "还车纬度, 根据用户输入的还车地址转换成对应的纬度, 如: 上海市人民广场的纬度是31.233568"
          },
          longitude: {
            type: "string",
            description: "还车经度, 根据用户输入的还车地址转换成对应的经度, 如: 上海市人民广场的经度是121.475914"
          },
          adCode: {
            type: "string",
            description: "还车行政区划编码, 如: 310101"
          },
          cityName: {
            type: "string",
            description: "还车城市名称, 如: 上海市"
          },
          cityCode: {
            type: "string",
            description: "还车城市区号, 如: 上海市为021"
          },
          dateStr: {
            type: "string",
            description: "还车日期, 如: 2025年07月20日 10:00, 如果没有年份信息默认为2025年, 还车车时间大于当前时间"
          },
          locationName: {
            type: "string",
            description: "还车地点名称, 如: 上海市人民广场"
          }
        },
        required: ["latitude", "longitude", "adCode", "cityName", "cityCode", "dateStr", "locationName"]
      },
      vehicleDisplayGroupId: {
        type: "string",
        description: "聚合组ID，来源于 MCP工具 search_carList_page_v3 接口返回的车辆数据中vehicles字段中的vehicleDisplayGroupId, 类似数字的字符串"
      },
    },
    required: ["pickupRentalInfo", "dropoffRentalInfo", "vehicleDisplayGroupId"]
  }
}

/**
 * 
 * @param pickupRentalInfo 
 * @param dropoffRentalInfo 
 * @param vehicleDisplayGroupId 
 * @returns 
 */
export async function handleCarMorePriceLink(request: any, pickupRentalInfo: any, dropoffRentalInfo: any, vehicleDisplayGroupId: string) {
  const paramsTimestamp = Date.now(); // 当前时间戳
  const pickupDatetime = toTimestamp(pickupRentalInfo?.dateStr) || '';
  const dropoffDatetime = toTimestamp(dropoffRentalInfo?.dateStr) || '';
  const rentInfo = {
    dropOffLog: dropoffRentalInfo?.longitude || pickupRentalInfo?.longitude,
    dropOffLat: dropoffRentalInfo?.latitude || pickupRentalInfo?.latitude,
    dropOffTime: dropoffDatetime,
    pickupTime: pickupDatetime,
    pickupLat: pickupRentalInfo?.latitude,
    pickupLog: pickupRentalInfo?.longitude,
    vehicleDisplayGroupId,
    mcpSessionId: request?.sessionId,
  }
  await getUbt({
    pointId: 'mcp_link_more_price_all',
    businessInfo: {
      ...rentInfo,
    }
  });
 
  const shortUrl = `https://m.hellobike.com/hellorentmoreprice?from=quoteQrCode&vehicleDisplayGroupId=${vehicleDisplayGroupId}&bizCityCode=${pickupRentalInfo?.cityCode}&bizCityName=${pickupRentalInfo?.cityName}&bizLocationName=${pickupRentalInfo?.locationName}&bizLatitude=${pickupRentalInfo?.latitude}&bizLongitude=${pickupRentalInfo?.longitude}&bizAdCode=${pickupRentalInfo?.adCode}&startDatetime=${pickupDatetime}&endDatetime=${dropoffDatetime}&paramsTimestamp=${paramsTimestamp}&adSource=mcp`;
  await getUbt({
    pointId: 'mcp_link_more_price_success',
    businessInfo: {
      ...rentInfo,
      shortUrl,
    }
  });
  return {
    content: [
      {
        type: "text",
        text: `下单链接: https://api.cl2wm.cn/api/qrcode/code?text=${encodeURIComponent(shortUrl)}`,
      }
    ],
    isError: false
  };
}