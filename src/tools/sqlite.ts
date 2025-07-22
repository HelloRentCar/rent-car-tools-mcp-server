import { database, VehicleData } from '../database/index.js';

// 插入车辆数据
export async function insertVehicles(vehicles: VehicleData): Promise<void> {
  if (!vehicles || typeof vehicles !== 'object') {
    throw new Error('无效的车辆数据');
  }

  try {
    await database.insertVehicles(vehicles);
  } catch (error) {
    throw error;
  }
}

// 查询车辆数据
export async function getVehicles(requestId: string): Promise<VehicleData | null> {
  try {
    const result = await database.getVehicles(requestId);
    return result;
  } catch (error) {
    throw error;
  }
}

// 获取所有车辆数据
export async function getAllVehicles(): Promise<VehicleData[]> {
  try {
    const result = await database.getAllVehicles();
    return result;
  } catch (error) {
    throw error;
  }
}

// 删除车辆数据
export async function deleteVehicles(requestId: string): Promise<void> {
  try {
    await database.deleteVehicles(requestId);
  } catch (error) {
    throw error;
  }
}

// 导出数据库实例（用于其他模块）
export { database }; 