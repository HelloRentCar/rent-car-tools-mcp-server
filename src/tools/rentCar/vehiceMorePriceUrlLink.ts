import QRCode from 'qrcode';


/**
 * 生成以二维码图片形式的报价页面URL便于用户扫码操作
 */
export const MORE_PRICE_URL_LINK_TOOL = {
  name: "rent_car_more_price_link",
  description: "依赖 rent_car_search_carList_page_v3 工具中返回的车辆列表数据，根据用户选择车辆的聚合组ID（字段为vehicleDisplayGroupId），生成以二维码图片形式的报价页面URL便于用户扫码查看",
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
          datetime: {
            type: "number",
            description: "取车时间戳，单位精确到毫秒（注意：每次都要通过date +%s获取当前时间戳进行比对，输入的时间应大于当前系统时间，如果没有年份信息默认为2025年）1752664631778"
          },
          locationName: {
            type: "string",
            description: "取车地点名称, 如: 上海市人民广场"
          }
        },
        required: ["datetime", "latitude", "longitude", "cityName", "cityCode", "adCode", "locationName"]
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
          datetime: {
            type: "number",
            description: "还车时间戳，单位精确到毫秒（注意：每次都要通过date +%s获取当前时间戳进行比对，输入的时间应大于当前系统时间，如果没有年份信息默认为2025年）"
          },
          locationName: {
            type: "string",
            description: "还车地点名称, 如: 上海市人民广场"
          }
        },
        required: ["datetime", "latitude", "longitude", "cityName", "cityCode", "adCode", "locationName"]
      },
      vehicleDisplayGroupId: {
        type: "string",
        description: "聚合组ID，来源于 MCP工具 search_carList_page_v3 接口返回的车辆数据中vehicles字段中的vehicleDisplayGroupId"
      }
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
export async function handleOrderUrlLink(pickupRentalInfo: any, dropoffRentalInfo: any, vehicleDisplayGroupId: string) {
  try {
    const paramsTimestamp = Date.now(); // 当前时间戳
    const url = `https://m.hellobike.com/hellorentmoreprice?from=quoteQrCode&vehicleDisplayGroupId=${vehicleDisplayGroupId}&bizCityCode=${pickupRentalInfo.cityCode}&bizCityName=${pickupRentalInfo.cityName}&bizLocationName=${pickupRentalInfo.locationName}&bizLatitude=${pickupRentalInfo.latitude}&bizLongitude=${pickupRentalInfo.longitude}&bizAdCode=${pickupRentalInfo.adCode}&bizBackCityCode=${dropoffRentalInfo.cityCode}&bizBackCityName=${dropoffRentalInfo.cityName}&bizBackLocationName=${dropoffRentalInfo.locationName}&bizBackLatitude=${dropoffRentalInfo.latitude}&bizBackLongitude=${dropoffRentalInfo.longitude}&bizBackAdCode=${dropoffRentalInfo.adCode}&startDatetime=${pickupRentalInfo.datetime}&endDatetime=${dropoffRentalInfo.datetime}&paramsTimestamp=${paramsTimestamp}`;
    const qrCode = await QRCode.toDataURL(url);
    const base64Data = qrCode.split(',')[1];
    const result: any = {
      content: [{
        type: "image",
        data: base64Data,
        mimeType: 'image/png'
      },
      ],
      isError: false
    };
    result.content.push({
      type: "text",
      text: `下单链接: ${url}`,
    });
    return result;
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