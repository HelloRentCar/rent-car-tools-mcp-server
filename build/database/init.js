import { database } from './index.js';
import { MigrationManager } from './migrations.js';
// 数据库初始化类
export class DatabaseInitializer {
    migrationManager;
    constructor() {
        this.migrationManager = new MigrationManager(database);
    }
    // 初始化数据库
    async initialize() {
        try {
            // 运行数据库迁移
            await this.migrationManager.migrate();
            // 获取迁移状态
            const status = await this.migrationManager.getMigrationStatus();
        }
        catch (error) {
            throw error;
        }
    }
    // 获取数据库状态
    async getStatus() {
        try {
            const migrationStatus = await this.migrationManager.getMigrationStatus();
            return {
                initialized: migrationStatus.applied.length > 0,
                migrations: {
                    applied: migrationStatus.applied,
                    pending: migrationStatus.pending.length,
                    total: migrationStatus.total
                }
            };
        }
        catch (error) {
            return {
                initialized: false,
                migrations: {
                    applied: [],
                    pending: 0,
                    total: 0
                }
            };
        }
    }
    // 关闭数据库连接
    close() {
        database.close();
    }
}
// 创建全局初始化器实例
export const dbInitializer = new DatabaseInitializer();
