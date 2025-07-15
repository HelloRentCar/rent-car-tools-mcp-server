// 车辆数据类型
export interface VehicleData {
  requestId: string;
  vehicles: string;
}

// 数据库查询结果类型
export interface VehicleRecord extends VehicleData {
  id: number;
  created_at: string;
  updated_at: string;
}

// 数据库配置类型
export interface DatabaseConfig {
  path: string;
  verbose?: boolean;
  timeout?: number;
}

// 数据库操作结果类型
export interface DatabaseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// 分页查询参数
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

// 分页查询结果
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 