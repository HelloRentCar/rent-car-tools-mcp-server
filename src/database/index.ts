import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 获取当前模块的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 数据库配置
const DB_CONFIG = {
  path: path.join(__dirname, '../../carListData.sqlite'),
  verbose: process.env.NODE_ENV === 'development'
};

// 数据库连接类
export class Database {
  private db: sqlite3.Database;
  private static instance: Database;
  private initialized: boolean = false;

  private constructor() {
    this.db = new sqlite3.Database(DB_CONFIG.path, (err) => {
      if (err) {
        console.error('数据库连接失败:', err.message);
        throw err;
      }
      console.log('成功连接到SQLite数据库');
    });
  }

  // 单例模式
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  // 确保数据库已初始化
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initTables();
      this.initialized = true;
    }
  }

  // 检查表是否存在指定列
  private async columnExists(table: string, column: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `PRAGMA table_info(${table})`,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            // 这里需要获取所有行来检查列是否存在
            this.db.all(
              `PRAGMA table_info(${table})`,
              (err, allRows) => {
                if (err) {
                  reject(err);
                } else {
                  const hasColumn = allRows.some((row: any) => row.name === column);
                  resolve(hasColumn);
                }
              }
            );
          }
        }
      );
    });
  }

  // 初始化表结构
  private async initTables(): Promise<void> {
    // 首先创建基础表（如果不存在）
    const createVehiclesTable = `
      CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requestId TEXT,
        vehicles TEXT
      )
    `;

    await new Promise<void>((resolve, reject) => {
      this.db.run(createVehiclesTable, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // 检查并添加缺失的列
    const columnsToAdd = [
      { name: 'created_at', sql: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updated_at', sql: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
    ];

    for (const column of columnsToAdd) {
      const exists = await this.columnExists('vehicles', column.name);
      if (!exists) {
        console.log(`添加列: ${column.name}`);
        await new Promise<void>((resolve, reject) => {
          this.db.run(
            `ALTER TABLE vehicles ADD COLUMN ${column.name} ${column.sql}`,
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
    }

    // 创建索引
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_vehicles_request_id ON vehicles(requestId)',
      'CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON vehicles(created_at)'
    ];

    for (const indexSql of indexes) {
      await new Promise<void>((resolve, reject) => {
        this.db.run(indexSql, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }

  // 插入车辆数据
  public async insertVehicles(data: VehicleData): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      // 使用兼容的SQL语句
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO vehicles (requestId, vehicles, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `);

      stmt.run(data.requestId, data.vehicles, (err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
      stmt.finalize();
    });
  }

  // 查询车辆数据
  public async getVehicles(requestId: string): Promise<VehicleData | null> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT requestId, vehicles FROM vehicles WHERE requestId = ?',
        [requestId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row as VehicleData | null);
          }
        }
      );
    });
  }

  // 获取所有车辆数据
  public async getAllVehicles(): Promise<VehicleData[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT requestId, vehicles FROM vehicles ORDER BY id DESC',
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as VehicleData[]);
          }
        }
      );
    });
  }

  // 删除车辆数据
  public async deleteVehicles(requestId: string): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM vehicles WHERE requestId = ?',
        [requestId],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  // 关闭数据库连接
  public close(): void {
    this.db.close((err) => {
      if (err) {
        console.error('关闭数据库失败:', err.message);
      } else {
        console.log('数据库连接已关闭');
      }
    });
  }
}

// 数据类型定义
export interface VehicleData {
  requestId: string;
  vehicles: string;
}

// 导出单例实例
export const database = Database.getInstance(); 