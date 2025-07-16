/**
 * 商品列表页接口响应数据
 */

/**
 * 门店标签
 */
interface IStoreTerms {
	termCode?:string;    // 标签code
	termType?:string;    // 标签类型
	termName?:string;    // 标签名称
	labelUrls?:{         // 标签图片
        url?:string;     // 图片URL地址
    }[];
}

/**
 * 最低价供应商信息
 */
interface IMinPriceSupplier {
	pickupStraightLineDistance?:string;  // 直线距离，单位：米
	totalPrice?:number;                  // 总价
	originTotalPrice?:string;            // 优惠券优惠前总价
	fixedPrice?:string;                  // 一口价
	dailyPrice?:string;                  // 日均价
	activityDailyPrice?:string;          // 优惠后日均价
	activityNickName?:string;            // 活动简称
	activityType?:number;                // 活动类型
	activityAmount?:number;              // 供应商活动扣减
	promoAmount?:number;                 // 优惠券扣减
	promoDays?:number;                   // 次卡抵扣天数
	platSubsidyAmount?:number;           // 算法立减
	helloPriceKey?:string;               // 哈啰价格key
	algorithmPriceKey?:string;           // 算法埋点价格key
	pickupType?:string;                  // 取车方式
	dropoffType?:string;                 // 还车方式
	merchantId?:string;                  // 商户ID
	timeShare?:boolean;                  // 是否分时报价
	subsidyType?: number;                // 0 -- 无， 1-- 打车补贴
	freeSendCarDoorFeeAmount?:number;    // 送车费减免
	superSpecialCarLowStock?:boolean;    // 特价车低库存标识
	newCardGoodsGroupIds?:string[];      // 仅限新套餐卡专区 SceneCode=13 该车辆在列表匹配后的活动群组 通过列表和浮层传给前端，前端在详情和提单页传回来
}

/**
 * 车辆商品信息
 */
export interface IVehicles {
	vehicleTerms?:string;                // 车型标签
	storeTerms?:IStoreTerms[];           // 门店标签
	priceTotalNum?:string;               // 报价数量
	vehicleTotalNum?:number;             // 子车型数量
	minPriceSupplier?:IMinPriceSupplier; // 最低报价信息
	firstPriceSupplier?:IMinPriceSupplier; // 最先报价信息
	suppliers?:any[];                    // 供应商列表，提供该车型的所有供应商
	childVehicleList?:any[];             // 子车型列表，同品牌下的其他车型
	vehicleDisplayGroupId?: string;       // 聚合组ID
	groupCode?:string;                   // 车型分组code
	vehicleName?:string;                 // 聚合组名称
	brandName?:string;                   // 品牌名
	groupName?:string;                   // 分组名称
	displacement?:string;                // 排量，如"1.5L"
	transmissionType?:string;            // 1:自动,2:手动
	transmissionName?:string;            // 自动, 手动
	passengerNo?:string;                 // 座位数
	doorNo?:string;                      // 车门数，如"4"
	fuelTypeName?:string;                // 燃油类型名称，如"汽油"
	licenseType?:string;                 // 车牌类型，如"蓝牌"
	licenseTag?:string;                  // 牌照
	mobileImgUrl?:string;                // 车型图片
	needShowHelloBrand?:boolean;         // 是否显示哈啰品牌店 banner
	needShowSelfBrand?:boolean;          // 是否显示哈啰自营 banner
	fromSplit?:boolean;                  // 是否源自拆分
	isShowRemand?:boolean;               // 是否显示免押提示弹窗， null/false不显示，true 显示
	shoppingGuideMsg?:string;            // 车型导购语
	locationSourceType?:number;          // 0：固定位；1：普通算法排序
	enterpriseInfo?:any[];               // 政企员工报价信息
}
export interface ICarInfo {
	groupName?:string;
	vehicles?:IVehicles[]; // 车型列表
	totalVehicleNum?:number; // 车型总数
	guideTermList?:any[]; //即时用车筛选引导
	guideTermPosition?:number;// 筛选引导标签位置
	guideTermVehicleNum?:number;// 筛选引导报价数量
	guideTermDTOList?:any[];// 即时用车筛选引导
	expTags?:number[]; // 实验控制。100001:本地牌照实验;
	specialPriceMinAmount?:number; //特价车报价最低报价
	pickUpRentCenterId?:number; //租车中心id（取车）
	requestId?:string;
	meituanCardTwiceQuery?:boolean; // 美团卡是否进行了二次查询
	cardMatchGoodsGroupSize?:number; // 次卡匹配商品群组的数量
	longTermReduction?:boolean;//是否命中长租期保险折扣
}



// 门店标签图片
export interface ILabelUrl {
  status: string;
  url: string;
}

// 门店标签
export interface IStoreTerm {
  termType: number;
  viewType: number;
  termName: string;
  termCode: string;
  labelUrls?: ILabelUrl[];
}

// 角标标签
export interface ICornerTerm {
  termType: number;
  viewType: number;
  termName: string;
  termCode: string;
}

// 供应商信息
export interface ISupplierInfo {
  supplierName: string;
  supplierCode: string;
  companyId: string;
  companyName: string;
  supplierTerms: any[]; // 可细化
}

// 车型信息
export interface IVehicleInfo {
  vehicleDisplayGroupId: string;
  vehicleDisplayGroupName: string;
  vehicleSeriesName: string;
  vehicleSeriesId: string;
  vehicleModelId: string;
  vehicleCode: string;
  vehicleName: string;
  groupCode: string;
  groupName: string;
  brandName: string;
  displacement: string;
  displacementRange: string[];
  transmissionType: string;
  passengerNo: string;
  doorNo: number;
  fuelTypeName: number;
  licenseType: string;
  licenseTag: string;
  pcImgUrl: string;
  mobileImgUrl: string;
  modelYear: string;
  suggestedRetailPrice: number;
  carLevelGroupList: { groupCode: string; groupName: string }[];
  vehicleColorList: any[]; // 可细化
}

// 供应商
export interface ISupplier {
  subSuppliers: any[]; // 可细化
  localPickupSite: boolean;
  channelCode: string;
  platformCode: string;
  merchantId: string;
  platformEntryType: number;
  supplierInfo: ISupplierInfo;
  vehicleInfo: IVehicleInfo;
  vehicleTerms: any[]; // 可细化
  cornerTerms?: ICornerTerm[];
  pickupType: string;
  dropoffType: string;
  pickupSiteGuid: string;
  pickupSiteName: string;
  dropoffSiteGuid: string;
  goodsId: string;
  straightLineDistance: string;
  pickupStraightLineDistance: string;
  dropoffStraightLineDistance: string;
  originTotalPrice: number;
  totalPrice: number;
  promoCardPlan: boolean;
  supplierTotalPrice: number;
  dailyPrice: number;
  originDailyPrice: number;
  rentalAmount: number;
  insuranceFeeAmount: number;
  serviceFeeAmount: number;
  hitch: boolean;
  helloPriceKey: string;
  algorithmPriceKey: string;
  siteCommentScore: number; // 门店评分
  termCodeList: string[];
  hasStock: boolean;
  goodsGroupIds: number[];
  timeShare: boolean;
  showRemand: boolean;
  superSpecialCarLowStock: boolean;
  newCardAllDays: number;
  chooseCarShowFlag: boolean;
  inquiryDesc: object;
  quoteServiceType: number;
  nonLocalDeliverRate: boolean;
}

// 主体类型
export interface IVehicleDetail {
  suppliers: ISupplier[];
  requestId: string;
}