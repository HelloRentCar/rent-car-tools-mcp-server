# 数据库模块文档

## 概述

本项目使用 SQLite 作为本地数据库，提供了完整的 TypeScript 支持和数据库管理功能。

## 特性

- ✅ **SQLite 数据库**: 轻量级、零配置的文件型数据库
- ✅ **TypeScript 支持**: 完整的类型定义和类型安全
- ✅ **单例模式**: 确保数据库连接的唯一性
- ✅ **迁移管理**: 支持数据库结构版本控制
- ✅ **异步操作**: 所有数据库操作都是异步的
- ✅ **错误处理**: 完善的错误处理和日志记录
- ✅ **索引优化**: 自动创建必要的数据库索引

## 文件结构

```
src/database/
├── index.ts          # 主数据库类
├── types.ts          # TypeScript 类型定义
├── migrations.ts     # 数据库迁移管理
├── init.ts           # 数据库初始化
├── example.ts        # 使用示例
└── README.md         # 本文档
```

## 快速开始

### 1. 基本使用

```typescript
import { database, VehicleData } from './database/index.js';

// 插入数据
const vehicleData: VehicleData = {
  requestId: 'unique-request-id',
  vehicles: JSON.stringify([{ id: 'car-001', brand: 'Toyota' }])
};

await database.insertVehicles(vehicleData);

// 查询数据
const result = await database.getVehicles('unique-request-id');

// 获取所有数据
const allVehicles = await database.getAllVehicles();

// 删除数据
await database.deleteVehicles('unique-request-id');
```

### 2. 数据类型

```typescript
interface VehicleData {
  requestId: string;    // 请求ID，唯一标识
  vehicles: string;     // 车辆数据（JSON字符串）
}
```

### 3. 数据库初始化

数据库会在应用启动时自动初始化：

```typescript
import { dbInitializer } from './database/init.js';

// 手动初始化（通常不需要）
await dbInitializer.initialize();

// 获取数据库状态
const status = await dbInitializer.getStatus();
```

## 迁移管理

### 添加新的迁移

在 `migrations.ts` 文件中添加新的迁移：

```typescript
const migrations: Migration[] = [
  // ... 现有迁移
  {
    version: 3,
    description: '添加新字段',
    up: `
      ALTER TABLE vehicles ADD COLUMN new_field TEXT;
    `,
    down: `
      -- 回滚逻辑
    `
  }
];
```

### 迁移状态

```typescript
const status = await migrationManager.getMigrationStatus();
console.log(status);
// 输出: { applied: [1, 2], pending: [3], total: 3 }
```

## 性能优化

### 1. 索引

数据库会自动创建以下索引：
- `idx_vehicles_request_id`: 请求ID索引
- `idx_vehicles_created_at`: 创建时间索引
- `idx_vehicles_status`: 状态索引（如果存在）

### 2. 连接池

使用单例模式确保只有一个数据库连接，避免连接泄漏。

### 3. 事务支持

所有写操作都支持事务，确保数据一致性。

## 错误处理

```typescript
try {
  await database.insertVehicles(data);
} catch (error) {
  console.error('数据库操作失败:', error);
  // 处理错误
}
```

## 开发建议

### 1. 数据验证

在插入数据前进行验证：

```typescript
if (!data.requestId || !data.vehicles) {
  throw new Error('无效的数据格式');
}
```

### 2. 日志记录

使用项目统一的日志系统：

```typescript
import { logger } from '../logger.js';

logger.info('数据库操作成功', { requestId: data.requestId });
```

### 3. 测试

运行示例代码进行测试：

```typescript
import { runDatabaseExamples } from './database/example.js';

await runDatabaseExamples();
```

## 替代方案

如果 SQLite 不满足需求，可以考虑：

### 1. LowDB (JSON文件数据库)
```bash
npm install lowdb
```

### 2. NeDB (MongoDB风格)
```bash
npm install nedb
```

### 3. PouchDB (CouchDB兼容)
```bash
npm install pouchdb
```

## 注意事项

1. **文件权限**: 确保应用有读写数据库文件的权限
2. **并发访问**: SQLite 对并发写入有限制，建议使用队列
3. **数据备份**: 定期备份数据库文件
4. **内存使用**: 大数据量时注意内存使用情况

## 故障排除

### 常见问题

1. **数据库锁定错误**
   - 检查是否有其他进程在使用数据库
   - 确保正确关闭数据库连接

2. **权限错误**
   - 检查数据库文件权限
   - 确保目录可写

3. **迁移失败**
   - 检查迁移SQL语法
   - 查看错误日志

### 调试模式

设置环境变量启用详细日志：

```bash
NODE_ENV=development npm run dev
``` 