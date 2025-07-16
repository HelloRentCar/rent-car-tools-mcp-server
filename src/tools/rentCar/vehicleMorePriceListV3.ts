import { getFetch } from "../../common/index.js";
import { ResponseResult } from "../../types/index.js";
import { IVehicleDetail } from "../../types/searchPage.js";

/** 用户查询具体车辆的全部供应商报价数据工具 */
export const VEHICLEMOREPRICELISTV3_TOOL = {
  name: "rent_vehicle_more_price_list_v3",
  description: "依赖 rent_car_search_carList_page_v3 工具中返回的车辆列表数据，获取特定车辆的详细价格信息，包含不同供应商的价格对比和门店评分等信息",
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
          cityCode: {
            type: "string",
            description: "取车城市区号, 如: 021"
          },
          datetime: {
            type: "number",
            description: "取车时间戳，单位精确到毫秒（注意：每次都要通过date +%s获取当前时间戳进行比对，输入的时间应大于当前系统时间，如果没有年份信息默认为2025年）"
          }
        },
        required: ["latitude", "longitude", "cityCode", "datetime"]
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
          cityCode: {
            type: "string",
            description: "还车城市区号, 如: 上海市为021"
          },
          datetime: {
            type: "number",
            description: "还车时间戳，单位精确到毫秒（注意：每次都要通过date +%s获取当前时间戳进行比对，输入的时间应大于当前系统时间，如果没有年份信息默认为2025年）"
          }
        },
        required: ["datetime", "latitude", "longitude", "cityCode"]
      },
      groupCode: {
        type: "string",
        description: "车型分组code",
      },
      vehicleDisplayGroupId: {
        type: "string",
        description: "聚合组ID"
      },
    },
    required: ["pickupRentalInfo", "dropoffRentalInfo", "groupCode", "vehicleDisplayGroupId"]
  },
};

/**
 * 用户查询具体车辆的全部供应商报价数据工具
 * @param pickupRentalInfo 取车信息
 * @param dropoffRentalInfo 还车信息
 * @param groupCode 车型分组code
 * @param vehicleDisplayGroupId 聚合组ID
 */
export async function handleVehicleMorePriceListV3(pickupRentalInfo: any, dropoffRentalInfo: any, groupCode: string, vehicleDisplayGroupId: string) {
  const fetch = await getFetch();
  const reqJson = {
    "action": "vehicle.more.price.list.v3",
    "pickupRentalInfo": {
      "cityCode": pickupRentalInfo?.cityCode || '021',
      "latitude": pickupRentalInfo?.latitude || '31.23136',
      "longitude": pickupRentalInfo?.longitude || '121.47004',
      "datetime": pickupRentalInfo?.datetime
    },
    "dropoffRentalInfo": {
      "cityCode": dropoffRentalInfo?.cityCode || pickupRentalInfo?.cityCode || '021',
      "latitude": dropoffRentalInfo?.latitude || pickupRentalInfo?.latitude || '31.23136',
      "longitude": dropoffRentalInfo?.longitude || pickupRentalInfo?.longitude || '121.47004',
      "datetime": dropoffRentalInfo?.datetime
    },
    "skip": 0,
    "groupCode": groupCode,
    "vehicleDisplayGroupId": vehicleDisplayGroupId,
  }
  const response = await fetch('https://a.hellobike.com/rent/api?vehicle.more.price.list.v3', {
    method: "POST",
    body: JSON.stringify(reqJson),
    headers: {
      "Content-Type": "application/json"
    }
  });
  const fullData: ResponseResult<IVehicleDetail> = await response.json();
  if (+fullData?.code === 0) {
    const result = {
      content: [{
        type: "text",
        text: `数据处理中...`,
        data: fullData?.data?.suppliers?.map((item: any) => {
          return {
            vehicleInfo: item?.vehicleInfo,
            siteCommentScore: item?.siteCommentScore || 0,
            supplierInfo: item?.supplierInfo,
            cornerTerms: item?.cornerTerms,
            storeTerms: item?.storeTerms,
            terms: item?.terms,
            pickupType: item?.pickupType,
            dropoffType: item?.dropoffType,
            pickupSiteGuid: item?.pickupSiteGuid,
            goodsId: item?.goodsId,
            straightLineDistance: item?.straightLineDistance,
            pickupStraightLineDistance: item?.pickupStraightLineDistance,
            dropoffStraightLineDistance: item?.dropoffStraightLineDistance,
            originTotalPrice: item?.originTotalPrice,
            totalPrice: item?.totalPrice,
            promoCardPlan: item?.promoCardPlan,
          }
        }) || [],
        requestId: fullData?.data?.requestId || '',
      }],
      isError: false
    };
    result.content.push({
      type: "text",
      text: `该车型下更多供应商报价查询识别: ${JSON.stringify(result?.content?.[0]?.data || [])}`,
      requestId: result?.content?.[0]?.requestId || '',
      data: [],
    });
    return result;
  }
  return {
    content: [{
      type: "text",
      text: `该车型下更多供应商报价查询识别：${fullData?.msg}`,
      data: [],
      requestId: '',
    }],
    isError: true
  };
}

