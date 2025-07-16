export const getApiKey = () => {
  const apiKey = process.env.AMAP_MAPS_API_KEY;
  return apiKey ?? '';
}
export const getApiKeyValidate = (apiKey: string) => {
  if (!apiKey) {
    // console.error("AMAP_MAPS_API_KEY environment variable is not set");
    // process.exit(1);
    return {
      content: [{
        type: "text",
        text: "AMAP_MAPS_API_KEY environment variable is not set"
      }],
      isError: true
    }
  }
  return {
    isError: false
  }
}
export const AMAP_MAPS_API_KEY = getApiKey();
const REGEOCODE_TOOL = {
  name: "maps_regeocode",
  description: "将一个经纬度坐标转换为行政区划地址信息",
  inputSchema: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "经纬度"
      }
    },
    required: ["location"]
  }
};
const GEO_TOOL = {
  name: "maps_geo",
  description: "将详细的结构化地址转换为经纬度坐标。支持对地标性名胜景区、建筑物名称解析为经纬度坐标",
  inputSchema: {
    type: "object",
    properties: {
      address: {
        type: "string",
        description: "待解析的结构化地址信息"
      },
      city: {
        type: "string",
        description: "指定查询的城市"
      }
    },
    required: ["address"]
  }
};
const IP_LOCATION_TOOL = {
  name: "maps_ip_location",
  description: "IP 定位根据用户输入的 IP 地址，定位 IP 的所在位置",
  inputSchema: {
    type: "object",
    properties: {
      ip: {
        type: "string",
        description: "IP地址",
      }
    },
    required: ["ip"],
  }
};
const WEATHER_TOOL = {
  name: "maps_weather",
  description: "根据城市名称或者标准adcode查询指定城市的天气",
  inputSchema: {
    type: "object",
    properties: {
      city: {
        type: "string",
        description: "城市名称或者adcode"
      }
    },
    required: ["city"]
  }
};
const BICYCLING_TOOL = {
  name: "maps_bicycling",
  description: "骑行路径规划用于规划骑行通勤方案，规划时会考虑天桥、单行线、封路等情况。最大支持 500km 的骑行路线规划",
  inputSchema: {
    type: "object",
    properties: {
      origin: {
        type: "string",
        description: "出发点经纬度，坐标格式为：经度，纬度"
      },
      destination: {
        type: "string",
        description: "目的地经纬度，坐标格式为：经度，纬度"
      }
    },
    required: ["origin", "destination"]
  }
};
const WALKING_TOOL = {
  name: "maps_direction_walking",
  description: "步行路径规划 API 可以根据输入起点终点经纬度坐标规划100km 以内的步行通勤方案，并且返回通勤方案的数据",
  inputSchema: {
    type: "object",
    properties: {
      origin: {
        type: "string",
        description: "出发点经度，纬度，坐标格式为：经度，纬度"
      },
      destination: {
        type: "string",
        description: "目的地经度，纬度，坐标格式为：经度，纬度"
      }
    },
    required: ["origin", "destination"]
  }
};
const DRIVING_TOOl = {
  name: "maps_direction_driving",
  description: "驾车路径规划 API 可以根据用户起终点经纬度坐标规划以小客车、轿车通勤出行的方案，并且返回通勤方案的数据。",
  inputSchema: {
    type: "object",
    properties: {
      origin: {
        type: "string",
        description: "出发点经度，纬度，坐标格式为：经度，纬度"
      },
      destination: {
        type: "string",
        description: "目的地经度，纬度，坐标格式为：经度，纬度"
      }
    },
    required: ["origin", "destination"]
  }
};
const TRANSIT_INTEGRATED_TOOL = {
  name: "maps_direction_transit_integrated",
  description: "公交路径规划 API 可以根据用户起终点经纬度坐标规划综合各类公共（火车、公交、地铁）交通方式的通勤方案，并且返回通勤方案的数据，跨城场景下必须传起点城市与终点城市",
  inputSchema: {
    type: "object",
    properties: {
      origin: {
        type: "string",
        description: "出发点经度，纬度，坐标格式为：经度，纬度"
      },
      destination: {
        type: "string",
        description: "目的地经度，纬度，坐标格式为：经度，纬度"
      },
      city: {
        type: "string",
        description: "公共交通规划起点城市"
      },
      cityd: {
        type: "string",
        description: "公共交通规划终点城市"
      }
    },
    required: ["origin", "destination", "city", "cityd"]
  }
};
const DISTANCE_TOOL = {
  name: "maps_distance",
  description: "距离测量 API 可以测量两个经纬度坐标之间的距离,支持驾车、步行以及球面距离测量",
  inputSchema: {
    type: "object",
    properties: {
      origins: {
        type: "string",
        description: "起点经度，纬度，可以传多个坐标，使用分号隔离，比如120,30;120,31，坐标格式为：经度，纬度"
      },
      destination: {
        type: "string",
        description: "终点经度，纬度，坐标格式为：经度，纬度"
      },
      type: {
        type: "string",
        description: "距离测量类型,1代表驾车距离测量，0代表直线距离测量，3步行距离测量"
      }
    },
    required: ["origins", "destination"]
  }
};
const TEXT_SEARCH_TOOL = {
  name: "maps_text_search",
  description: "关键词搜，根据用户传入关键词，搜索出相关的POI",
  inputSchema: {
    type: "object",
    properties: {
      keywords: {
        type: "string",
        description: "搜索关键词"
      },
      city: {
        type: "string",
        description: "查询城市"
      },
      types: {
        type: "string",
        description: "POI类型，比如加油站"
      }
    },
    required: ["keywords"]
  }
};
const AROUND_SEARCH_TOOL = {
  name: "maps_around_search",
  description: "周边搜，根据用户传入关键词以及坐标location，搜索出radius半径范围的POI",
  inputSchema: {
    type: "object",
    properties: {
      keywords: {
        type: "string",
        description: "搜索关键词"
      },
      location: {
        type: "string",
        description: "中心点经度纬度"
      },
      radius: {
        type: "string",
        description: "搜索半径"
      }
    },
    required: ["location"]
  }
};
const SEARCH_DETAIL_TOOL = {
  name: "maps_search_detail",
  description: "查询关键词搜或者周边搜获取到的POI ID的详细信息",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "关键词搜或者周边搜获取到的POI ID"
      }
    },
    required: ["id"]
  }
};
export const MAPS_TOOLS = [
  REGEOCODE_TOOL,
  GEO_TOOL,
  IP_LOCATION_TOOL,
  WEATHER_TOOL,
  SEARCH_DETAIL_TOOL,
  BICYCLING_TOOL,
  WALKING_TOOL,
  DRIVING_TOOl,
  TRANSIT_INTEGRATED_TOOL,
  DISTANCE_TOOL,
  TEXT_SEARCH_TOOL,
  AROUND_SEARCH_TOOL
];

export const handleReGeocode = async (location: string) => {
  const url = new URL("https://restapi.amap.com/v3/geocode/regeo");
  url.searchParams.append("location", location);
  url.searchParams.append("key", AMAP_MAPS_API_KEY);
  url.searchParams.append("source", "ts_mcp");
  const apiKeyValidate = getApiKeyValidate(AMAP_MAPS_API_KEY);
  if (apiKeyValidate.isError) {
    return apiKeyValidate;
  }
  const response = await fetch(url.toString());
  const data = await response.json();
  if (data.status !== "1") {
    return {
      content: [{
        type: "text",
        text: `RGeocoding failed: ${data.info || data.infocode}`
      }],
      isError: true
    };
  }
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        provice: data.regeocode.addressComponent.province,
        city: data.regeocode.addressComponent.city,
        district: data.regeocode.addressComponent.district
      }, null, 2)
    }],
    isError: false
  };
}
export const handleGeo = async (address: string, city?: string, sig?: string) => {
  const url = new URL("https://restapi.amap.com/v3/geocode/geo");
  url.searchParams.append("key", AMAP_MAPS_API_KEY);
  url.searchParams.append("address", address);
  url.searchParams.append("source", "ts_mcp");
  const apiKeyValidate = getApiKeyValidate(AMAP_MAPS_API_KEY);
  if (apiKeyValidate.isError) {
    return apiKeyValidate;
  }
  const response = await fetch(url.toString());
  const data = await response.json();
  if (data.status !== "1") {
    return {
      content: [{
        type: "text",
        text: `Geocoding failed: ${data.info || data.infocode}`
      }],
      isError: true
    };
  }
  const geocodes = data.geocodes || [];
  const res = geocodes.length > 0 ? geocodes.map((geo: any) => ({
    country: geo.country,
    province: geo.province,
    city: geo.city,
    citycode: geo.citycode,
    district: geo.district,
    street: geo.street,
    number: geo.number,
    adcode: geo.adcode,
    location: geo.location,
    level: geo.level
  })) : [];
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        return: res
      }, null, 2)
    }],
    isError: false
  };
}
export const handleIPLocation = async (ip: string) => {
  const url = new URL("https://restapi.amap.com/v3/ip");
  url.searchParams.append("ip", ip);
  url.searchParams.append("key", AMAP_MAPS_API_KEY);
  url.searchParams.append("source", "ts_mcp");
  const apiKeyValidate = getApiKeyValidate(AMAP_MAPS_API_KEY);
  if (apiKeyValidate.isError) {
    return apiKeyValidate;
  }
  const response = await fetch(url.toString());
  const data = await response.json();
  if (data.status !== "1") {
    return {
      content: [{
        type: "text",
        text: `IP Location failed: ${data.info || data.infocode}`
      }],
      isError: true
    };
  }
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        province: data.province,
        city: data.city,
        adcode: data.adcode,
        rectangle: data.rectangle
      }, null, 2)
    }],
    isError: false
  };
}
export const handleWeather = async (city: string) => {
  const url = new URL("https://restapi.amap.com/v3/weather/weatherInfo");
  url.searchParams.append("city", city);
  url.searchParams.append("key", AMAP_MAPS_API_KEY);
  url.searchParams.append("source", "ts_mcp");
  url.searchParams.append("extensions", "all");
  const apiKeyValidate = getApiKeyValidate(AMAP_MAPS_API_KEY);
  if (apiKeyValidate.isError) {
    return apiKeyValidate;
  }
  const response = await fetch(url.toString());
  const data = await response.json();
  if (data.status !== "1") {
    return {
      content: [{
        type: "text",
        text: `Get weather failed: ${data.info || data.infocode}`
      }],
      isError: true
    };
  }
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        city: data.forecasts[0].city,
        forecasts: data.forecasts[0].casts
      }, null, 2)
    }],
    isError: false
  };
}
export const handleSearchDetail = async (id: string) => {
  const url = new URL("https://restapi.amap.com/v3/place/detail");
  url.searchParams.append("id", id);
  url.searchParams.append("key", AMAP_MAPS_API_KEY);
  url.searchParams.append("source", "ts_mcp");
  const apiKeyValidate = getApiKeyValidate(AMAP_MAPS_API_KEY);
  if (apiKeyValidate.isError) {
    return apiKeyValidate;
  }
  const response = await fetch(url.toString());
  const data = await response.json();
  if (data.status !== "1") {
    return {
      content: [{
        type: "text",
        text: `Get poi detail failed: ${data.info || data.infocode}`
      }],
      isError: true
    };
  }
  let poi = data.pois[0];
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        id: poi.id,
        name: poi.name,
        location: poi.location,
        address: poi.address,
        business_area: poi.business_area,
        city: poi.cityname,
        type: poi.type,
        alias: poi.alias,
        ...poi.biz_ext
      }, null, 2)
    }],
    isError: false
  };
}
export const handleBicycling = async (origin: string, destination: string) => {
  const url = new URL("https://restapi.amap.com/v4/direction/bicycling");
  url.searchParams.append("key", AMAP_MAPS_API_KEY);
  url.searchParams.append("origin", origin);
  url.searchParams.append("destination", destination);
  url.searchParams.append("source", "ts_mcp");
  const apiKeyValidate = getApiKeyValidate(AMAP_MAPS_API_KEY);
  if (apiKeyValidate.isError) {
    return apiKeyValidate;
  }
  const response = await fetch(url.toString());
  const data = await response.json();
  if (data.errcode !== 0) {
    return {
      content: [{
        type: "text",
        text: `Direction bicycling failed: ${data.info || data.infocode}`
      }],
      isError: true
    };
  }
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        data: {
          origin: data.data.origin,
          destination: data.data.destination,
          paths: data.data.paths.map((path: any) => {
            return {
              distance: path.distance,
              duration: path.duration,
              steps: path.steps.map((step: any) => {
                return {
                  instruction: step.instruction,
                  road: step.road,
                  distance: step.distance,
                  orientation: step.orientation,
                  duration: step.duration,
                };
              })
            };
          })
        }
      }, null, 2)
    }],
    isError: false
  };
}
export const handleWalking = async (origin: string, destination: string) => {
  const url = new URL("https://restapi.amap.com/v3/direction/walking");
  url.searchParams.append("key", AMAP_MAPS_API_KEY);
  url.searchParams.append("origin", origin);
  url.searchParams.append("destination", destination);
  url.searchParams.append("source", "ts_mcp");
  const apiKeyValidate = getApiKeyValidate(AMAP_MAPS_API_KEY);
  if (apiKeyValidate.isError) {
    return apiKeyValidate;
  }
  const response = await fetch(url.toString());
  const data = await response.json();
  if (data.status !== "1") {
    return {
      content: [{
        type: "text",
        text: `Direction Walking failed: ${data.info || data.infocode}`
      }],
      isError: true
    };
  }
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        route: {
          origin: data.route.origin,
          destination: data.route.destination,
          paths: data.route.paths.map((path: any) => {
            return {
              distance: path.distance,
              duration: path.duration,
              steps: path.steps.map((step: any) => {
                return {
                  instruction: step.instruction,
                  road: step.road,
                  distance: step.distance,
                  orientation: step.orientation,
                  duration: step.duration,
                };
              })
            };
          })
        }
      }, null, 2)
    }],
    isError: false
  };
}
export const handleDriving = async (origin: string, destination: string) => {
  const url = new URL("https://restapi.amap.com/v3/direction/driving");
  url.searchParams.append("key", AMAP_MAPS_API_KEY);
  url.searchParams.append("origin", origin);
  url.searchParams.append("destination", destination);
  url.searchParams.append("source", "ts_mcp");
  const apiKeyValidate = getApiKeyValidate(AMAP_MAPS_API_KEY);
  if (apiKeyValidate.isError) {
    return apiKeyValidate;
  }
  const response = await fetch(url.toString());
  const data = await response.json();
  if (data.status !== "1") {
    return {
      content: [{
        type: "text",
        text: `Direction Driving failed: ${data.info || data.infocode}`
      }],
      isError: true
    };
  }
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        route: {
          origin: data.route.origin,
          destination: data.route.destination,
          paths: data.route.paths.map((path: any) => {
            return {
              path: path.path,
              distance: path.distance,
              duration: path.duration,
              steps: path.steps.map((step: any) => {
                return {
                  instruction: step.instruction,
                  road: step.road,
                  distance: step.distance,
                  orientation: step.orientation,
                  duration: step.duration,
                };
              })
            };
          })
        }
      }, null, 2)
    }],
    isError: false
  };
}
export const handleTransitIntegrated = async (origin: string, destination: string, city: string = "", cityd: string = "") => {
  const url = new URL("https://restapi.amap.com/v3/direction/transit/integrated");
  url.searchParams.append("key", AMAP_MAPS_API_KEY);
  url.searchParams.append("origin", origin);
  url.searchParams.append("destination", destination);
  url.searchParams.append("city", city);
  url.searchParams.append("cityd", cityd);
  url.searchParams.append("source", "ts_mcp");
  const apiKeyValidate = getApiKeyValidate(AMAP_MAPS_API_KEY);
  if (apiKeyValidate.isError) {
    return apiKeyValidate;
  }
  const response = await fetch(url.toString());
  const data = await response.json();
  if (data.status !== "1") {
    return {
      content: [{
        type: "text",
        text: `Direction Transit Integrated failed: ${data.info || data.infocode}`
      }],
      isError: true
    };
  }
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        route: {
          origin: data.route.origin,
          destination: data.route.destination,
          distance: data.route.distance,
          transits: data.route.transits ? data.route.transits.map((transit: any) => {
            return {
              duration: transit.duration,
              walking_distance: transit.walking_distance,
              segments: transit.segments ? transit.segments.map((segment: any) => {
                return {
                  walking: {
                    origin: segment.walking.origin,
                    destination: segment.walking.destination,
                    distance: segment.walking.distance,
                    duration: segment.walking.duration,
                    steps: segment.walking && segment.walking.steps ? segment.walking.steps.map((step: any) => {
                      return {
                        instruction: step.instruction,
                        road: step.road,
                        distance: step.distance,
                        action: step.action,
                        assistant_action: step.assistant_action
                      };
                    }) : [],
                  },
                  bus: {
                    buslines: segment.bus && segment.bus.buslines ? segment.bus.buslines.map((busline: any) => {
                      return {
                        name: busline.name,
                        departure_stop: {
                          name: busline.departure_stop.name
                        },
                        arrival_stop: {
                          name: busline.arrival_stop.name
                        },
                        distance: busline.distance,
                        duration: busline.duration,
                        via_stops: busline.via_stops ? busline.via_stops.map((via_stop: any) => {
                          return {
                            name: via_stop.name
                          };
                        }) : [],
                      };
                    }) : [],
                  },
                  entrance: {
                    name: segment.entrance.name
                  },
                  exit: {
                    name: segment.exit.name
                  },
                  railway: {
                    name: segment.railway.name,
                    trip: segment.railway.trip
                  }
                };
              }) : [],
            };
          }) : [],
        }
      }, null, 2)
    }],
    isError: false
  };
}
export const handleDistance = async (origins: string, destination: string, type: string = "1") => {
  const url = new URL("https://restapi.amap.com/v3/distance");
  url.searchParams.append("key", AMAP_MAPS_API_KEY);
  url.searchParams.append("origins", origins);
  url.searchParams.append("destination", destination);
  url.searchParams.append("type", type);
  url.searchParams.append("source", "ts_mcp");
  const apiKeyValidate = getApiKeyValidate(AMAP_MAPS_API_KEY);
  if (apiKeyValidate.isError) {
    return apiKeyValidate;
  }
  const response = await fetch(url.toString());
  const data = await response.json();
  if (data.status !== "1") {
    return {
      content: [{
        type: "text",
        text: `Direction Distance failed: ${data.info || data.infocode}`
      }],
      isError: true
    };
  }
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        results: data.results.map((result: any) => {
          return {
            origin_id: result.origin_id,
            dest_id: result.dest_id,
            distance: result.distance,
            duration: result.duration
          };
        })
      }, null, 2)
    }],
    isError: false
  };
}
export const handleTextSearch = async (keywords: string, city: string = "", citylimit: string = "false") => {
  const url = new URL("https://restapi.amap.com/v3/place/text");
  url.searchParams.append("key", AMAP_MAPS_API_KEY);
  url.searchParams.append("keywords", keywords);
  url.searchParams.append("city", city);
  url.searchParams.append("citylimit", citylimit);
  url.searchParams.append("source", "ts_mcp");
  const apiKeyValidate = getApiKeyValidate(AMAP_MAPS_API_KEY);
  if (apiKeyValidate.isError) {
    return apiKeyValidate;
  }
  const response = await fetch(url.toString());
  const data = await response.json();
  if (data.status !== "1") {
    return {
      content: [{
        type: "text",
        text: `Text Search failed: ${data.info || data.infocode}`
      }],
      isError: true
    };
  }
  let resciytes = data.suggestion && data.suggestion.ciytes ? data.suggestion.ciytes.map((city: any) => {
    return {
      name: city.name
    };
  }) : [];
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        suggestion: {
          keywords: data.suggestion.keywords,
          ciytes: resciytes,
        },
        pois: data.pois.map((poi: any) => {
          return {
            id: poi.id,
            name: poi.name,
            address: poi.address,
            typecode: poi.typecode
          };
        })
      }, null, 2)
    }],
    isError: false
  };
}
export const handleAroundSearch = async (location: string, radius: string = "1000", keywords: string = "") => {
  const url = new URL("https://restapi.amap.com/v3/place/around");
  url.searchParams.append("key", AMAP_MAPS_API_KEY);
  url.searchParams.append("location", location);
  url.searchParams.append("radius", radius);
  url.searchParams.append("keywords", keywords);
  url.searchParams.append("source", "ts_mcp");
  const apiKeyValidate = getApiKeyValidate(AMAP_MAPS_API_KEY);
  if (apiKeyValidate.isError) {
    return apiKeyValidate;
  }
  const response = await fetch(url.toString());
  const data = await response.json();
  if (data.status !== "1") {
    return {
      content: [{
        type: "text",
        text: `Around Search failed: ${data.info || data.infocode}`
      }],
      isError: true
    };
  }
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        pois: data.pois.map((poi: any) => {
          return {
            id: poi.id,
            name: poi.name,
            address: poi.address,
            typecode: poi.typecode
          };
        })
      }, null, 2)
    }],
    isError: false
  };
}
