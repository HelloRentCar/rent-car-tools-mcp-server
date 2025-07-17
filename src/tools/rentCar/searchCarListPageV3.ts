import { getFetch } from "../../common/index.js";
import { ResponseResult } from "../../types/index.js";
import { ICarInfo } from "../../types/searchPage.js";
import { toTimestamp } from "../../common/index.js";

/**
 * 查询车辆列表工具
 */
export const SEARCHCARLISTV3_TOOL = {
  name: "search_carList_page_v3",
  description: "首先调用该工具！！拿到返回的vehicleDisplayGroupId，才能使用其他工具！！根据取还车时间和地点查询可用车辆，支持品牌、类型等筛选条件，返回所有合适的车辆列表和价格信息",
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
              description: "筛选项名称，code与name值相同！！，例如 '别克'、'保时捷'"
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
          dateStr: {
            type: "string",
            description: "取车日期, 如: 2025年07月20日 10:00, 如果没有年份信息默认为2025年, 取车时间大于当前时间"
          },
        },
        required: ["latitude", "longitude", "cityCode", "dateStr"]
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
          dateStr: {
            type: "string",
            description: "还车日期, 如: 2025年07月20日 10:00, 如果没有年份信息默认为2025年, 还车时间大于取车时间"
          },
        },
        required: ["latitude", "longitude", "cityCode", "dateStr"]
      }
    },
    required: ["pickupRentalInfo", "dropoffRentalInfo"]
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
  // console.log('pickupRentalInfo', pickupRentalInfo);
  const pickupDatetime = toTimestamp(pickupRentalInfo?.dateStr);
  const dropoffDatetime = toTimestamp(dropoffRentalInfo?.dateStr);
  const reqJson = {
    "action": "veh.search.page.v3",
    "pickupRentalInfo": {
      "cityCode": pickupRentalInfo?.cityCode,
      "latitude": pickupRentalInfo?.latitude,
      "longitude": pickupRentalInfo?.longitude,
      "dateStr": pickupRentalInfo?.dateStr,
      "datetime": pickupDatetime
    },
    "dropoffRentalInfo": {
      "cityCode": dropoffRentalInfo?.cityCode || pickupRentalInfo?.cityCode,
      "latitude": dropoffRentalInfo?.latitude || pickupRentalInfo?.latitude,
      "longitude": dropoffRentalInfo?.longitude || pickupRentalInfo?.longitude,
      "dateStr": dropoffRentalInfo?.dateStr,
      "datetime": dropoffDatetime
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

  if (+fullData?.code === 0) {
    return {
      content: [{
        type: "text",
        text: `数据处理中...`,
        data: fullData?.data?.vehicles?.map((item: any) => ({
          vehicleDisplayGroupId: item?.vehicleDisplayGroupId,
          vehicleDisplayGroupName: item?.vehicleDisplayGroupName,
          vehicleSeriesName: item?.vehicleSeriesName,
          vehicleSeriesId: item?.vehicleSeriesId,
          vehicleModelId: item?.vehicleModelId,
          vehicleCode: item?.vehicleCode,
          vehicleName: item?.vehicleName,
          groupCode: item?.groupCode,
          groupName: item?.groupName,
          brandName: item?.brandName,
          displacement: item?.displacement,
          passengerNo: item?.passengerNo,
          transmissionType: item?.transmissionType,
          doorNo: item?.doorNo,
          fuelTypeName: item?.fuelTypeName,
          pcImgUrl: item?.pcImgUrl,
          mobileImgUrl: item?.mobileImgUrl,
          modelYear: item?.modelYear,
          suggestedRetailPrice: item?.suggestedRetailPrice,
          carLevelGroupList: item?.carLevelGroupList || [],
          vehicleColorList: item?.vehicleColorList || [],
          licenseType: item?.licenseType,
          minPriceSupplier: item?.minPriceSupplier || {},
          dailyLowestPrice: item?.dailyLowestPrice,
          lowestTotalPrice: item?.lowestTotalPrice,
          priceTotalNum: item?.priceTotalNum || {},
          restNum: item?.restNum,
          childVehicleList: item?.childVehicleList || [],
          needShowHelloBrand: item?.needShowHelloBrand,
          vehicleTerms: item?.vehicleTerms,
          storeTerms: item?.storeTerms || [],
          terms: item?.terms || [],
          vehicleTotalNum: item?.vehicleTotalNum,
        })) || [],
        requestId: fullData?.data?.requestId,
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

