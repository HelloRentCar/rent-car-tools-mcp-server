import { z } from "zod";
import { getFetch } from "../../common/index.js";
import { ResponseResult } from "../../types/index.js";
import { ICarInfo } from "../../types/searchPage.js";

/**
 * 查询车辆列表工具
 */
export const SEARCHCARLISTV3_TOOL = {
  name: "search_carList_page_v3",
  description: "用户根据未来的取车时间和还车时间和地点查询可预约车辆商品和价格数据。",
  inputSchema: {
    type: "object",
    properties: {
      filter: {
        type: "array",
        description: "车辆筛选条件列表。每个筛选项用于限定返回的车辆范围，例如品牌、类型等。每个筛选项包含如下字段：code（筛选项编码，如品牌名拼音）、name（筛选项名称）、type（筛选类型，4为品牌）、disabled（是否禁用）、commonFilter（是否为常用筛选）、checkType（筛选方式，如'drop'为下拉选择）。例如：[{ code: '别克', name: '别克', type: 4, disabled: false, commonFilter: true, checkType: 'drop' }]",
        items: {
          type: "object",
          properties: {
            code: {
              type: "string",
              description: "筛选项编码，例如 '别克'、'保时捷'"
            },
            name: {
              type: "string",
              description: "筛选项名称，例如 '别克'、'保时捷'"
            },
            type: {
              type: "number",
              description: "筛选类型，4表示品牌"
            },
            disabled: {
              type: "boolean",
              description: "该筛选项是否被禁用，默认值是false"
            },
            commonFilter: {
              type: "boolean",
              description: "是否为常用筛选项，默认值是true"
            },
            checkType: {
              type: "string",
              description: "筛选方式，如 'drop' 表示下拉选择，默认值是'drop'"
            }
          },
          // required: ["code", "name", "type", "disabled", "commonFilter", "checkType"]
        }
      },
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
      }
    },
  },
};

/**
 * 查询车辆列表
 * @param pickupRentalInfo 取车信息
 * @param dropoffRentalInfo 还车信息
 * @returns 车辆列表
 */
export async function handleSearchListV3(pickupRentalInfo: any, dropoffRentalInfo: any, filter = []) {
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
      "cityCode": dropoffRentalInfo?.cityCode || pickupRentalInfo?.cityCode || '021',
      "latitude": dropoffRentalInfo?.latitude || pickupRentalInfo?.latitude || '31.23136',
      "longitude": dropoffRentalInfo?.longitude || pickupRentalInfo?.longitude || '121.47004',
      "datetime": dropoffRentalInfo?.datetime
    },
    "filter": filter || [],
    "pageIndex": 1,
    "pageSize": 40,
  }
  const response = await fetch('https://a.hellobike.com/rent/api?veh.search.page.v3', {
    method: "POST",
    body: JSON.stringify(reqJson),
    headers: {
      "Content-Type": "application/json"
    }
  });
  const fullData: ResponseResult<ICarInfo> = await response.json();

  // if (+fullData.code === 0) {
  // const filteredVehicles = fullData?.data?.vehicles?.map((vehicle) => ({
  //   vehicleTotalNum: vehicle?.vehicleTotalNum,
  //   minPriceSupplier: vehicle?.minPriceSupplier,
  //   vehicleDisplayGroupId: vehicle?.vehicleDisplayGroupId,
  //   brandName: vehicle?.brandName,
  //   transmissionType: vehicle?.transmissionType,
  //   transmissionName: vehicle?.transmissionName,
  //   fuelTypeName: vehicle?.fuelTypeName,
  //   licenseType: vehicle?.licenseType,
  //   licenseTag: vehicle?.licenseTag,
  //   shoppingGuideMsg: vehicle?.shoppingGuideMsg,
  //   locationSourceType: vehicle?.locationSourceType,
  //   enterpriseInfo: vehicle?.enterpriseInfo,
  // })) || [];
  // console.log('filteredVehicles...', filteredVehicles);
  // return {
  //   code: fullData?.code,
  //   msg: fullData?.msg,
  //   data: {
  //     vehicles: filteredVehicles,
  //     totalVehicleNum: fullData?.data?.totalVehicleNum || 0,
  //     requestId: fullData?.data?.requestId || '',
  //   }
  // };
  // return fullData;
  if (+fullData?.code === 0) {
    return {
      content: [{
        type: "text",
        text: `数据处理中...`,
        data: fullData?.data?.vehicles || [],
        requestId: fullData?.data?.requestId || '',
      }],
      isError: false
    };
  }

  return {
    content: [{
      type: "text",
      text: `询价查询识别：${fullData?.msg}`,
      data: [],
      requestId: '',
    }],
    isError: true
  };
}

