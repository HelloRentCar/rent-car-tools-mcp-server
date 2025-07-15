import { database, VehicleData } from './index.js';

// 数据库使用示例
export class DatabaseExample {

  // 示例：插入车辆数据
  static async insertVehicleExample(): Promise<void> {
    try {
      const vehicleData: VehicleData = {
        requestId: 'example-request-001',
        vehicles: JSON.stringify([
          {
            id: 'car-001',
            brand: 'Toyota',
            model: 'Camry',
            year: 2023,
            price: 25000
          }
        ])
      };

      await database.insertVehicles(vehicleData);
      console.log('车辆数据插入成功');
    } catch (error) {
      console.error('插入失败:', error);
    }
  }

  // 示例：查询车辆数据
  static async queryVehicleExample(): Promise<void> {
    try {
      const requestId = 'example-request-001';
      const result = await database.getVehicles(requestId);

      if (result) {
        console.log('查询结果:', result);
        const vehicles = JSON.parse(result.vehicles);
        console.log('解析后的车辆数据:', vehicles);
      } else {
        console.log('未找到数据');
      }
    } catch (error) {
      console.error('查询失败:', error);
    }
  }

  // 示例：获取所有车辆数据
  static async getAllVehiclesExample(): Promise<void> {
    try {
      const allVehicles = await database.getAllVehicles();
      console.log(`总共找到 ${allVehicles.length} 条记录`);

      allVehicles.forEach((record, index) => {
        console.log(`记录 ${index + 1}:`, {
          requestId: record.requestId,
          vehicleCount: JSON.parse(record.vehicles).length
        });
      });
    } catch (error) {
      console.error('获取所有数据失败:', error);
    }
  }

  // 示例：删除车辆数据
  static async deleteVehicleExample(): Promise<void> {
    try {
      const requestId = 'example-request-001';
      await database.deleteVehicles(requestId);
      console.log('车辆数据删除成功');
    } catch (error) {
      console.error('删除失败:', error);
    }
  }

  // 示例：批量操作
  static async batchOperationExample(): Promise<void> {
    try {
      // 批量插入测试数据
      const testData: VehicleData[] = [
        {
          requestId: 'batch-001',
          vehicles: JSON.stringify([{ id: 'car-001', brand: 'BMW' }])
        },
        {
          requestId: 'batch-002',
          vehicles: JSON.stringify([{ id: 'car-002', brand: 'Audi' }])
        },
        {
          requestId: 'batch-003',
          vehicles: JSON.stringify([{ id: 'car-003', brand: 'Mercedes' }])
        }
      ];

      for (const data of testData) {
        await database.insertVehicles(data);
        console.log(`插入: ${data.requestId}`);
      }

      // 查询所有数据
      const allData = await database.getAllVehicles();
      console.log(`批量操作后总记录数: ${allData.length}`);

    } catch (error) {
      console.error('批量操作失败:', error);
    }
  }
}

// 运行示例的函数
export async function runDatabaseExamples(): Promise<void> {
  console.log('=== 数据库使用示例 ===');

  try {
    // 插入示例
    console.log('\n1. 插入车辆数据示例');
    await DatabaseExample.insertVehicleExample();

    // 查询示例
    console.log('\n2. 查询车辆数据示例');
    await DatabaseExample.queryVehicleExample();

    // 获取所有数据示例
    console.log('\n3. 获取所有车辆数据示例');
    await DatabaseExample.getAllVehiclesExample();

    // 批量操作示例
    console.log('\n4. 批量操作示例');
    await DatabaseExample.batchOperationExample();

    // 删除示例
    console.log('\n5. 删除车辆数据示例');
    await DatabaseExample.deleteVehicleExample();

    console.log('\n=== 示例执行完成 ===');

  } catch (error) {
    console.error('示例执行失败:', error);
  }
} 