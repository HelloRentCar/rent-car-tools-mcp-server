// 迁移列表
const migrations = [
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
    db;
    constructor(database) {
        this.db = database.db;
        this.initMigrationTable();
    }
    // 初始化迁移表
    initMigrationTable() {
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
    async getAppliedMigrations() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT version FROM migrations ORDER BY version', (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows.map((row) => row.version));
                }
            });
        });
    }
    // 记录迁移
    async recordMigration(migration) {
        return new Promise((resolve, reject) => {
            this.db.run('INSERT INTO migrations (version, description) VALUES (?, ?)', [migration.version, migration.description], (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    // 执行迁移
    async migrate() {
        try {
            const appliedMigrations = await this.getAppliedMigrations();
            const pendingMigrations = migrations.filter(m => !appliedMigrations.includes(m.version));
            if (pendingMigrations.length === 0) {
                return;
            }
            for (const migration of pendingMigrations) {
                await new Promise((resolve, reject) => {
                    this.db.serialize(() => {
                        this.db.run('BEGIN TRANSACTION');
                        this.db.run(migration.up, (err) => {
                            if (err) {
                                this.db.run('ROLLBACK');
                                reject(err);
                            }
                            else {
                                this.recordMigration(migration).then(() => {
                                    this.db.run('COMMIT');
                                    resolve();
                                }).catch(reject);
                            }
                        });
                    });
                });
            }
        }
        catch (error) {
            throw error;
        }
    }
    // 获取迁移状态
    async getMigrationStatus() {
        const appliedMigrations = await this.getAppliedMigrations();
        const pendingMigrations = migrations.filter(m => !appliedMigrations.includes(m.version));
        return {
            applied: appliedMigrations,
            pending: pendingMigrations,
            total: migrations.length
        };
    }
}
