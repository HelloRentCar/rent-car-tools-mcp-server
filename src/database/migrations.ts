import sqlite3 from 'sqlite3';
import { Database } from './index.js';

// 迁移版本记录
interface Migration {
  version: number;
  description: string;
  up: string;
  down?: string;
}

// 迁移列表
const migrations: Migration[] = [
  {
    version: 1,
    description: '创建车辆表基础结构',
    up: `
      CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requestId TEXT UNIQUE NOT NULL,
        vehicles TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_vehicles_request_id ON vehicles(requestId);
      CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON vehicles(created_at);
    `,
    down: `
      DROP TABLE IF EXISTS vehicles;
    `
  },
  {
    version: 2,
    description: '添加车辆状态字段',
    up: `
      ALTER TABLE vehicles ADD COLUMN status TEXT DEFAULT 'active';
      CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
    `,
    down: `
      -- SQLite不支持DROP COLUMN，需要重建表
      -- 这里只是示例，实际实现需要更复杂的逻辑
    `
  }
];

// 迁移管理类
export class MigrationManager {
  private db: sqlite3.Database;

  constructor(database: Database) {
    this.db = (database as any).db;
    this.initMigrationTable();
  }

  // 初始化迁移表
  private initMigrationTable(): void {
    const createMigrationTable = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version INTEGER UNIQUE NOT NULL,
        description TEXT NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.run(createMigrationTable);
  }

  // 获取已应用的迁移版本
  private async getAppliedMigrations(): Promise<number[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT version FROM migrations ORDER BY version',
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map((row: any) => row.version));
          }
        }
      );
    });
  }

  // 记录迁移
  private async recordMigration(migration: Migration): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO migrations (version, description) VALUES (?, ?)',
        [migration.version, migration.description],
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

  // 执行迁移
  public async migrate(): Promise<void> {
    try {
      const appliedMigrations = await this.getAppliedMigrations();
      const pendingMigrations = migrations.filter(
        m => !appliedMigrations.includes(m.version)
      );

      if (pendingMigrations.length === 0) {
        console.log('数据库已是最新版本');
        return;
      }

      console.log(`发现 ${pendingMigrations.length} 个待执行的迁移`);

      for (const migration of pendingMigrations) {
        console.log(`执行迁移 v${migration.version}: ${migration.description}`);

        await new Promise<void>((resolve, reject) => {
          this.db.serialize(() => {
            this.db.run('BEGIN TRANSACTION');

            this.db.run(migration.up, (err) => {
              if (err) {
                this.db.run('ROLLBACK');
                reject(err);
              } else {
                this.recordMigration(migration).then(() => {
                  this.db.run('COMMIT');
                  resolve();
                }).catch(reject);
              }
            });
          });
        });

        console.log(`迁移 v${migration.version} 执行完成`);
      }

      console.log('所有迁移执行完成');
    } catch (error) {
      console.error('迁移执行失败:', error);
      throw error;
    }
  }

  // 获取迁移状态
  public async getMigrationStatus(): Promise<{
    applied: number[];
    pending: Migration[];
    total: number;
  }> {
    const appliedMigrations = await this.getAppliedMigrations();
    const pendingMigrations = migrations.filter(
      m => !appliedMigrations.includes(m.version)
    );

    return {
      applied: appliedMigrations,
      pending: pendingMigrations,
      total: migrations.length
    };
  }
} 