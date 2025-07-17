import { toTimestamp } from "../../common/index.js";
// import { ResponseResult } from "../../types/index.js";
import { getFetch } from "../../common/index.js";
import QRCode from 'qrcode';
import { ResponseResult } from "../../types/index.js";

/**
 * 生成以二维码图片形式的报价页面URL便于用户扫码操作
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
        description: "聚合组ID"
      },
    },
    required: ["pickupRentalInfo", "dropoffRentalInfo"]
  }
}

/**
 * 
 * @param pickupRentalInfo 
 * @param dropoffRentalInfo 
 * @param vehicleDisplayGroupId 
 * @returns 
 */
export async function handleCarMorePriceLink(pickupRentalInfo: any, dropoffRentalInfo: any, vehicleDisplayGroupId: string) {
  const fetch = await getFetch();
  const paramsTimestamp = Date.now(); // 当前时间戳
  const pickupDatetime = toTimestamp(pickupRentalInfo?.dateStr) || '';
  const dropoffDatetime = toTimestamp(dropoffRentalInfo?.dateStr) || '';
  try {
    // &bizBackCityCode=${dropoffRentalInfo?.cityCode}&bizBackCityName=${dropoffRentalInfo?.cityName}&bizBackLocationName=${dropoffRentalInfo?.locationName}&bizBackLatitude=${dropoffRentalInfo?.latitude}&bizBackLongitude=${dropoffRentalInfo?.longitude}&bizBackAdCode=${dropoffRentalInfo?.adCode}
    // const shortUrl = `https://m.hellobike.com/hellorentmoreprice?from=quoteQrCode&vehicleDisplayGroupId=${vehicleDisplayGroupId}&bizCityCode=${pickupRentalInfo?.cityCode}&bizCityName=${pickupRentalInfo?.cityName}&bizLocationName=${pickupRentalInfo?.locationName}&bizLatitude=${pickupRentalInfo?.latitude}&bizLongitude=${pickupRentalInfo?.longitude}&bizAdCode=${pickupRentalInfo?.adCode}&startDatetime=${pickupDatetime}&endDatetime=${dropoffDatetime}&paramsTimestamp=${paramsTimestamp}`;
    const response = await fetch('https://rentfe-api.hellobike.com/rent/wechat/miniprogram/shortlink', {
      method: "POST",
      body: JSON.stringify({
        path: 'subPackages/morePrice/index',
        // env_version: 'trial',
        query: {
          vehicleDisplayGroupId: vehicleDisplayGroupId || '7282590291568427011',
          bizCityCode: pickupRentalInfo?.cityCode,
          bizCityName: pickupRentalInfo?.cityName,
          bizLocationName: pickupRentalInfo?.locationName,
          bizLatitude: pickupRentalInfo?.latitude,
          bizLongitude: pickupRentalInfo?.longitude,
          bizAdCode: pickupRentalInfo?.adCode,
          startDatetime: pickupDatetime,
          endDatetime: dropoffDatetime,
          paramsTimestamp,
        }
      }),
      headers: {
        'token': 'bearer_069d8537-9a8c-4e9c-88c6-c0e41ef18dd6',
        "Content-Type": "application/json"
      }
    });
    const fullData: ResponseResult<string> = await response.json();
    const shortUrl = fullData?.data || '';
    if (shortUrl) {
      const curQrCode = await QRCode.toDataURL(shortUrl) || '';
      const base64Data = curQrCode?.split(',')?.[1];
      // if (base64Data) {
      return {
        content: [
          {
            type: "image",
            data: base64Data,
            mimeType: 'image/png'
          },
          {
            type: "text",
            text: `下单链接: ${base64Data}`,
          }
        ],
        isError: false
      };
      // }
      // return {
      //   content: [{
      //     type: "text",
      //     text: `无二维码数据q`
      //   }],
      //   isError: false
      // };
    }
    return {
      content: [{
        type: "text",
        text: `无二维码数据${fullData?.code}`
      }],
      isError: false
    };
  } catch (e) {
    console.error('QRCode error', e);
    return {
      content: [{
        type: "text",
        text: `二维码生成失败: ${e instanceof Error ? e.message : String(e)}`
      }],
      isError: true
    };
  }
}