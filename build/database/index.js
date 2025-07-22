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
    db;
    static instance;
    initialized = false;
    constructor() {
        this.db = new sqlite3.Database(DB_CONFIG.path, (err) => {
            if (err) {
                throw err;
            }
        });
    }
    // 单例模式
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    // 确保数据库已初始化
    async ensureInitialized() {
        if (!this.initialized) {
            await this.initTables();
            this.initialized = true;
        }
    }
    // 检查表是否存在指定列
    async columnExists(table, column) {
        return new Promise((resolve, reject) => {
            this.db.get(`PRAGMA table_info(${table})`, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    // 这里需要获取所有行来检查列是否存在
                    this.db.all(`PRAGMA table_info(${table})`, (err, allRows) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            const hasColumn = allRows.some((row) => row.name === column);
                            resolve(hasColumn);
                        }
                    });
                }
            });
        });
    }
    // 初始化表结构
    async initTables() {
        // 首先创建基础表（如果不存在）
        const createVehiclesTable = `
      CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requestId TEXT,
        vehicles TEXT
      )
    `;
        await new Promise((resolve, reject) => {
            this.db.run(createVehiclesTable, (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
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
                await new Promise((resolve, reject) => {
                    this.db.run(`ALTER TABLE vehicles ADD COLUMN ${column.name} ${column.sql}`, (err) => {
                        if (err)
                            reject(err);
                        else
                            resolve();
                    });
                });
            }
        }
        // 创建索引
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_vehicles_request_id ON vehicles(requestId)',
            'CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON vehicles(created_at)'
        ];
        for (const indexSql of indexes) {
            await new Promise((resolve, reject) => {
                this.db.run(indexSql, (err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            });
        }
    }
    // 插入车辆数据
    async insertVehicles(data) {
        await this.ensureInitialized();
        return new Promise((resolve, reject) => {
            // 使用兼容的SQL语句
            const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO vehicles (requestId, vehicles, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `);
            stmt.run(data.requestId, data.vehicles, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
            stmt.finalize();
        });
    }
    // 查询车辆数据
    async getVehicles(requestId) {
        await this.ensureInitialized();
        return new Promise((resolve, reject) => {
            this.db.get('SELECT requestId, vehicles FROM vehicles WHERE requestId = ?', [requestId], (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row);
                }
            });
        });
    }
    // 获取所有车辆数据
    async getAllVehicles() {
        await this.ensureInitialized();
        return new Promise((resolve, reject) => {
            this.db.all('SELECT requestId, vehicles FROM vehicles ORDER BY id DESC', (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }
    // 删除车辆数据
    async deleteVehicles(requestId) {
        await this.ensureInitialized();
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM vehicles WHERE requestId = ?', [requestId], (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    // 关闭数据库连接
    close() {
        this.db.close((err) => {
        });
    }
}
// 导出单例实例
export const database = Database.getInstance();
