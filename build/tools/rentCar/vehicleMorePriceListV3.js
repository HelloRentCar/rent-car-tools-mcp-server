import { getFetch, toTimestamp } from "../../common/index.js";
import { getUbt } from "../../common/ubt.js";
/** 用户查询具体车辆的全部供应商报价数据工具 */
export const VEHICLEMOREPRICELISTV3_TOOL = {
    name: "vehicle_more_price_list_v3",
    description: "【工具链第二步】基于search_carList_page_v3返回的车辆数据，查询指定车辆的详细价格信息，包含不同供应商的价格对比和门店评分等信息",
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
            },
            groupCode: {
                type: "string",
                description: "分组code，来源于 MCP工具 search_carList_page_v3 接口返回的车辆数据中vehicles字段中的groupCode, 如: '5'"
            },
            vehicleDisplayGroupId: {
                type: "string",
                description: "聚合组ID，来源于 MCP工具 search_carList_page_v3 接口返回的车辆数据中vehicles字段中的vehicleDisplayGroupId, 类似数字的字符串"
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
export async function handleVehicleMorePriceListV3(pickupRentalInfo, dropoffRentalInfo, groupCode, vehicleDisplayGroupId) {
    const fetch = await getFetch();
    const pickupDatetime = toTimestamp(pickupRentalInfo?.dateStr);
    const dropoffDatetime = toTimestamp(dropoffRentalInfo?.dateStr);
    const reqJson = {
        "action": "vehicle.more.price.list.v3.mcp",
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
        "skip": 0,
        "groupCode": groupCode,
        "vehicleDisplayGroupId": vehicleDisplayGroupId,
    };
    const response = await fetch('https://a.hellobike.com/rent/api?vehicle.more.price.list.v3.mcp', {
        method: "POST",
        body: JSON.stringify(reqJson),
        headers: {
            "Content-Type": "application/json"
        }
    });
    const rentInfo = {
        dropOffLog: dropoffRentalInfo?.longitude || pickupRentalInfo?.longitude,
        dropOffLat: dropoffRentalInfo?.latitude || pickupRentalInfo?.latitude,
        dropOffTime: dropoffDatetime,
        pickupTime: pickupDatetime,
        pickupLat: pickupRentalInfo?.latitude,
        pickupLog: pickupRentalInfo?.longitude,
        groupCode,
        vehicleDisplayGroupId,
    };
    await getUbt({
        pointId: 'mcp_car_more_price_all',
        businessInfo: {
            ...rentInfo
        }
    });
    const fullData = await response.json();
    if (+fullData?.code === 0) {
        await getUbt({
            pointId: 'mcp_car_more_price_success',
            businessInfo: {
                ...rentInfo,
                requestId: fullData?.data?.requestId,
            }
        });
        const result = {
            content: [{
                    type: "text",
                    text: `数据处理中...`,
                    data: fullData?.data?.suppliers?.map((item) => {
                        return {
                            vehicleInfo: item?.vehicleInfo?.map((item) => ({
                                vehicleDisplayGroupId: item?.vehicleDisplayGroupId,
                                vehicleDisplayGroupName: item?.vehicleDisplayGroupName,
                                vehicleSeriesName: item?.vehicleSeriesName,
                                vehicleName: item?.vehicleName,
                                vehicleCode: item?.vehicleCode,
                                groupCode: item?.groupCode,
                                brandName: item?.brandName,
                                displacement: item?.displacement,
                                passengerNo: item?.passengerNo,
                                transmissionType: item?.transmissionType,
                                passengerNo: item?.passengerNo,
                                doorNo: item?.doorNo,
                                pcImgUrl: item?.pcImgUrl,
                                mobileImgUrl: item?.mobileImgUrl,
                                suggestedRetailPrice: item?.suggestedRetailPrice,
                            })) || [],
                            siteCommentScore: item?.siteCommentScore || 0,
                            supplierInfo: item?.supplierInfo?.map((item) => ({
                                supplierName: item?.supplierName,
                                companyName: item?.companyName,
                            })) || [],
                            cornerTerms: item?.cornerTerms?.map((item) => item?.termName) || [],
                            goodsId: item?.goodsId,
                            originTotalPrice: item?.originTotalPrice,
                            totalPrice: item?.totalPrice,
                        };
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
    await getUbt({
        pointId: 'mcp_car_more_price_error',
        businessInfo: {
            ...rentInfo,
            requestId: fullData?.data?.requestId,
            errorMsg: fullData?.msg,
        }
    });
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
