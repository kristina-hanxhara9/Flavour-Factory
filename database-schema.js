// Database Schema and Migration System for Bakery Scanner
// This provides a structured approach when moving from localStorage to a real database

class DatabaseSchema {
    constructor() {
        this.version = '2.0.0';
        this.schemas = this.defineSchemas();
    }

    defineSchemas() {
        return {
            // Products table
            products: {
                tableName: 'products',
                columns: {
                    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
                    name: { type: 'VARCHAR(255)', notNull: true, unique: true },
                    price: { type: 'DECIMAL(10,2)', notNull: true },
                    category: { type: 'VARCHAR(100)', defaultValue: 'other' },
                    description: { type: 'TEXT' },
                    image_urls: { type: 'JSON' }, // Array of training image URLs
                    ai_model_version: { type: 'VARCHAR(50)' },
                    training_accuracy: { type: 'DECIMAL(5,4)' }, // 0.8500 = 85%
                    is_active: { type: 'BOOLEAN', defaultValue: true },
                    allergens: { type: 'JSON' }, // Array of allergen strings
                    nutrition_info: { type: 'JSON' }, // Nutrition facts object
                    created_at: { type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP' },
                    updated_at: { type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }
                },
                indexes: [
                    { name: 'idx_product_name', columns: ['name'] },
                    { name: 'idx_product_category', columns: ['category'] },
                    { name: 'idx_product_active', columns: ['is_active'] }
                ]
            },

            // Sales table
            sales: {
                tableName: 'sales',
                columns: {
                    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
                    sale_number: { type: 'VARCHAR(50)', unique: true }, // Human-readable sale number
                    subtotal: { type: 'DECIMAL(10,2)', notNull: true },
                    tax_amount: { type: 'DECIMAL(10,2)', notNull: true },
                    total: { type: 'DECIMAL(10,2)', notNull: true },
                    payment_method: { type: 'VARCHAR(50)', defaultValue: 'cash' },
                    employee_name: { type: 'VARCHAR(255)' },
                    shift_id: { type: 'INTEGER', foreignKey: 'shifts.id' },
                    device_id: { type: 'VARCHAR(100)' },
                    location_id: { type: 'INTEGER', foreignKey: 'locations.id' },
                    customer_id: { type: 'INTEGER', foreignKey: 'customers.id' },
                    notes: { type: 'TEXT' },
                    is_refunded: { type: 'BOOLEAN', defaultValue: false },
                    refund_reason: { type: 'TEXT' },
                    created_at: { type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP' }
                },
                indexes: [
                    { name: 'idx_sale_date', columns: ['created_at'] },
                    { name: 'idx_sale_employee', columns: ['employee_name'] },
                    { name: 'idx_sale_shift', columns: ['shift_id'] },
                    { name: 'idx_sale_total', columns: ['total'] }
                ]
            },

            // Sale items table
            sale_items: {
                tableName: 'sale_items',
                columns: {
                    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
                    sale_id: { type: 'INTEGER', notNull: true, foreignKey: 'sales.id' },
                    product_id: { type: 'INTEGER', notNull: true, foreignKey: 'products.id' },
                    product_name: { type: 'VARCHAR(255)', notNull: true }, // Snapshot for history
                    unit_price: { type: 'DECIMAL(10,2)', notNull: true },
                    quantity: { type: 'INTEGER', notNull: true },
                    line_total: { type: 'DECIMAL(10,2)', notNull: true },
                    ai_confidence: { type: 'DECIMAL(5,4)' }, // Recognition confidence
                    discount_amount: { type: 'DECIMAL(10,2)', defaultValue: 0 },
                    created_at: { type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP' }
                },
                indexes: [
                    { name: 'idx_sale_items_sale', columns: ['sale_id'] },
                    { name: 'idx_sale_items_product', columns: ['product_id'] },
                    { name: 'idx_sale_items_date', columns: ['created_at'] }
                ]
            },

            // Shifts table
            shifts: {
                tableName: 'shifts',
                columns: {
                    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
                    employee_name: { type: 'VARCHAR(255)', notNull: true },
                    employee_id: { type: 'VARCHAR(100)' }, // Employee badge/ID
                    start_time: { type: 'TIMESTAMP', notNull: true },
                    end_time: { type: 'TIMESTAMP' },
                    break_duration: { type: 'INTEGER', defaultValue: 0 }, // Minutes
                    total_sales: { type: 'DECIMAL(10,2)', defaultValue: 0 },
                    total_transactions: { type: 'INTEGER', defaultValue: 0 },
                    total_items_sold: { type: 'INTEGER', defaultValue: 0 },
                    device_id: { type: 'VARCHAR(100)' },
                    location_id: { type: 'INTEGER', foreignKey: 'locations.id' },
                    notes: { type: 'TEXT' },
                    status: { type: 'VARCHAR(20)', defaultValue: 'active' }, // active, ended, paused
                    created_at: { type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP' }
                },
                indexes: [
                    { name: 'idx_shift_employee', columns: ['employee_name'] },
                    { name: 'idx_shift_date', columns: ['start_time'] },
                    { name: 'idx_shift_status', columns: ['status'] }
                ]
            },

            // Shift breaks table
            shift_breaks: {
                tableName: 'shift_breaks',
                columns: {
                    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
                    shift_id: { type: 'INTEGER', notNull: true, foreignKey: 'shifts.id' },
                    start_time: { type: 'TIMESTAMP', notNull: true },
                    end_time: { type: 'TIMESTAMP' },
                    break_type: { type: 'VARCHAR(50)', defaultValue: 'regular' }, // regular, lunch, emergency
                    duration_minutes: { type: 'INTEGER' },
                    created_at: { type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP' }
                },
                indexes: [
                    { name: 'idx_break_shift', columns: ['shift_id'] },
                    { name: 'idx_break_date', columns: ['start_time'] }
                ]
            },

            // Locations table (for multi-location businesses)
            locations: {
                tableName: 'locations',
                columns: {
                    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
                    name: { type: 'VARCHAR(255)', notNull: true },
                    address: { type: 'TEXT' },
                    phone: { type: 'VARCHAR(50)' },
                    email: { type: 'VARCHAR(255)' },
                    timezone: { type: 'VARCHAR(100)', defaultValue: 'UTC' },
                    currency: { type: 'VARCHAR(10)', defaultValue: 'EUR' },
                    tax_rate: { type: 'DECIMAL(5,4)', defaultValue: 0.2000 }, // 20%
                    is_active: { type: 'BOOLEAN', defaultValue: true },
                    settings: { type: 'JSON' }, // Location-specific settings
                    created_at: { type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP' }
                }
            },

            // Customers table (optional)
            customers: {
                tableName: 'customers',
                columns: {
                    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
                    name: { type: 'VARCHAR(255)' },
                    email: { type: 'VARCHAR(255)' },
                    phone: { type: 'VARCHAR(50)' },
                    loyalty_points: { type: 'INTEGER', defaultValue: 0 },
                    total_spent: { type: 'DECIMAL(10,2)', defaultValue: 0 },
                    visit_count: { type: 'INTEGER', defaultValue: 0 },
                    last_visit: { type: 'TIMESTAMP' },
                    preferences: { type: 'JSON' },
                    is_active: { type: 'BOOLEAN', defaultValue: true },
                    created_at: { type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP' }
                },
                indexes: [
                    { name: 'idx_customer_email', columns: ['email'] },
                    { name: 'idx_customer_phone', columns: ['phone'] }
                ]
            },

            // AI Training Sessions table
            ai_training_sessions: {
                tableName: 'ai_training_sessions',
                columns: {
                    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
                    product_id: { type: 'INTEGER', notNull: true, foreignKey: 'products.id' },
                    model_version: { type: 'VARCHAR(50)', notNull: true },
                    training_images_count: { type: 'INTEGER', notNull: true },
                    epochs: { type: 'INTEGER' },
                    final_accuracy: { type: 'DECIMAL(5,4)' },
                    final_loss: { type: 'DECIMAL(10,8)' },
                    training_duration_seconds: { type: 'INTEGER' },
                    training_data: { type: 'JSON' }, // Training parameters and results
                    status: { type: 'VARCHAR(20)', defaultValue: 'pending' }, // pending, running, completed, failed
                    error_message: { type: 'TEXT' },
                    created_at: { type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP' },
                    completed_at: { type: 'TIMESTAMP' }
                },
                indexes: [
                    { name: 'idx_training_product', columns: ['product_id'] },
                    { name: 'idx_training_status', columns: ['status'] },
                    { name: 'idx_training_date', columns: ['created_at'] }
                ]
            },

            // System logs table
            system_logs: {
                tableName: 'system_logs',
                columns: {
                    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
                    level: { type: 'VARCHAR(20)', notNull: true }, // ERROR, WARN, INFO, DEBUG
                    message: { type: 'TEXT', notNull: true },
                    context: { type: 'JSON' }, // Additional context data
                    device_id: { type: 'VARCHAR(100)' },
                    location_id: { type: 'INTEGER', foreignKey: 'locations.id' },
                    user_agent: { type: 'TEXT' },
                    ip_address: { type: 'VARCHAR(45)' },
                    stack_trace: { type: 'TEXT' },
                    created_at: { type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP' }
                },
                indexes: [
                    { name: 'idx_log_level', columns: ['level'] },
                    { name: 'idx_log_date', columns: ['created_at'] },
                    { name: 'idx_log_device', columns: ['device_id'] }
                ]
            },

            // Backups table
            backups: {
                tableName: 'backups',
                columns: {
                    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
                    backup_type: { type: 'VARCHAR(50)', notNull: true }, // full, incremental, manual
                    file_path: { type: 'VARCHAR(500)' },
                    cloud_url: { type: 'VARCHAR(500)' },
                    file_size_bytes: { type: 'BIGINT' },
                    checksum: { type: 'VARCHAR(128)' },
                    status: { type: 'VARCHAR(20)', defaultValue: 'pending' }, // pending, completed, failed
                    error_message: { type: 'TEXT' },
                    metadata: { type: 'JSON' }, // Backup metadata
                    created_at: { type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP' },
                    completed_at: { type: 'TIMESTAMP' }
                },
                indexes: [
                    { name: 'idx_backup_type', columns: ['backup_type'] },
                    { name: 'idx_backup_status', columns: ['status'] },
                    { name: 'idx_backup_date', columns: ['created_at'] }
                ]
            }
        };
    }

    // Generate SQL for different database types
    generateSQL(dbType = 'sqlite') {
        const sql = {
            sqlite: this.generateSQLiteSQL(),
            mysql: this.generateMySQLSQL(),
            postgresql: this.generatePostgreSQLSQL()
        };

        return sql[dbType] || sql.sqlite;
    }

    generateSQLiteSQL() {
        let sql = '';
        
        Object.values(this.schemas).forEach(schema => {
            sql += this.generateTableSQL(schema, 'sqlite') + '\n\n';
        });

        return sql;
    }

    generateMySQLSQL() {
        let sql = '';
        
        Object.values(this.schemas).forEach(schema => {
            sql += this.generateTableSQL(schema, 'mysql') + '\n\n';
        });

        return sql;
    }

    generatePostgreSQLSQL() {
        let sql = '';
        
        Object.values(this.schemas).forEach(schema => {
            sql += this.generateTableSQL(schema, 'postgresql') + '\n\n';
        });

        return sql;
    }

    generateTableSQL(schema, dbType) {
        const { tableName, columns, indexes } = schema;
        
        let sql = `CREATE TABLE ${tableName} (\n`;
        
        // Generate columns
        const columnSQL = Object.entries(columns).map(([columnName, columnDef]) => {
            return this.generateColumnSQL(columnName, columnDef, dbType);
        }).join(',\n');
        
        sql += columnSQL;
        
        // Add foreign key constraints
        const foreignKeys = Object.entries(columns)
            .filter(([_, def]) => def.foreignKey)
            .map(([columnName, def]) => {
                const [refTable, refColumn] = def.foreignKey.split('.');
                return `  FOREIGN KEY (${columnName}) REFERENCES ${refTable}(${refColumn})`;
            });
        
        if (foreignKeys.length > 0) {
            sql += ',\n' + foreignKeys.join(',\n');
        }
        
        sql += '\n);';
        
        // Add indexes
        if (indexes && indexes.length > 0) {
            sql += '\n\n';
            indexes.forEach(index => {
                sql += `CREATE INDEX ${index.name} ON ${tableName} (${index.columns.join(', ')});\n`;
            });
        }
        
        return sql;
    }

    generateColumnSQL(columnName, columnDef, dbType) {
        let sql = `  ${columnName} `;
        
        // Data type mapping
        const typeMapping = {
            sqlite: {
                'INTEGER': 'INTEGER',
                'VARCHAR': 'TEXT',
                'TEXT': 'TEXT',
                'DECIMAL': 'REAL',
                'BOOLEAN': 'INTEGER',
                'TIMESTAMP': 'DATETIME',
                'JSON': 'TEXT',
                'BIGINT': 'INTEGER'
            },
            mysql: {
                'INTEGER': 'INT',
                'VARCHAR': 'VARCHAR',
                'TEXT': 'TEXT',
                'DECIMAL': 'DECIMAL',
                'BOOLEAN': 'BOOLEAN',
                'TIMESTAMP': 'TIMESTAMP',
                'JSON': 'JSON',
                'BIGINT': 'BIGINT'
            },
            postgresql: {
                'INTEGER': 'INTEGER',
                'VARCHAR': 'VARCHAR',
                'TEXT': 'TEXT',
                'DECIMAL': 'DECIMAL',
                'BOOLEAN': 'BOOLEAN',
                'TIMESTAMP': 'TIMESTAMP',
                'JSON': 'JSONB',
                'BIGINT': 'BIGINT'
            }
        };
        
        const mapping = typeMapping[dbType] || typeMapping.sqlite;
        let dataType = columnDef.type;
        
        // Handle parameterized types
        if (dataType.includes('(')) {
            const baseType = dataType.split('(')[0];
            const params = dataType.match(/\((.*?)\)/)[1];
            dataType = `${mapping[baseType]}(${params})`;
        } else {
            dataType = mapping[dataType] || dataType;
        }
        
        sql += dataType;
        
        // Add constraints
        if (columnDef.primaryKey) {
            sql += ' PRIMARY KEY';
            if (columnDef.autoIncrement && dbType !== 'postgresql') {
                sql += dbType === 'sqlite' ? ' AUTOINCREMENT' : ' AUTO_INCREMENT';
            }
        }
        
        if (columnDef.notNull) {
            sql += ' NOT NULL';
        }
        
        if (columnDef.unique) {
            sql += ' UNIQUE';
        }
        
        if (columnDef.defaultValue) {
            sql += ` DEFAULT ${columnDef.defaultValue}`;
        }
        
        return sql;
    }
}

// Migration system
class DatabaseMigrator {
    constructor(databaseConnection) {
        this.db = databaseConnection;
        this.migrations = [];
    }

    addMigration(version, upFunction, downFunction) {
        this.migrations.push({
            version,
            up: upFunction,
            down: downFunction
        });
    }

    async migrate(targetVersion = null) {
        const currentVersion = await this.getCurrentVersion();
        const migrations = this.getMigrationsToRun(currentVersion, targetVersion);
        
        for (const migration of migrations) {
            console.log(`Running migration ${migration.version}`);
            
            try {
                await migration.up(this.db);
                await this.updateVersion(migration.version);
                console.log(`Migration ${migration.version} completed`);
            } catch (error) {
                console.error(`Migration ${migration.version} failed:`, error);
                throw error;
            }
        }
    }

    async rollback(targetVersion) {
        const currentVersion = await this.getCurrentVersion();
        const migrations = this.getMigrationsToRollback(currentVersion, targetVersion);
        
        for (const migration of migrations.reverse()) {
            console.log(`Rolling back migration ${migration.version}`);
            
            try {
                await migration.down(this.db);
                await this.updateVersion(this.getPreviousVersion(migration.version));
                console.log(`Rollback ${migration.version} completed`);
            } catch (error) {
                console.error(`Rollback ${migration.version} failed:`, error);
                throw error;
            }
        }
    }

    async getCurrentVersion() {
        try {
            const result = await this.db.get('SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1');
            return result ? result.version : '0.0.0';
        } catch (error) {
            // Schema migrations table doesn't exist, create it
            await this.db.run(`
                CREATE TABLE schema_migrations (
                    version VARCHAR(50) PRIMARY KEY,
                    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            return '0.0.0';
        }
    }

    async updateVersion(version) {
        await this.db.run(
            'INSERT INTO schema_migrations (version) VALUES (?)',
            [version]
        );
    }

    getMigrationsToRun(currentVersion, targetVersion) {
        return this.migrations.filter(migration => {
            const shouldRun = this.compareVersions(migration.version, currentVersion) > 0;
            if (targetVersion) {
                return shouldRun && this.compareVersions(migration.version, targetVersion) <= 0;
            }
            return shouldRun;
        }).sort((a, b) => this.compareVersions(a.version, b.version));
    }

    compareVersions(v1, v2) {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);
        
        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
            const part1 = parts1[i] || 0;
            const part2 = parts2[i] || 0;
            
            if (part1 > part2) return 1;
            if (part1 < part2) return -1;
        }
        
        return 0;
    }
}

// Data Access Layer
class BakeryDAL {
    constructor(database) {
        this.db = database;
    }

    // Products
    async createProduct(product) {
        const sql = `
            INSERT INTO products (name, price, category, description, allergens, nutrition_info)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const result = await this.db.run(sql, [
            product.name,
            product.price,
            product.category || 'other',
            product.description,
            JSON.stringify(product.allergens || []),
            JSON.stringify(product.nutritionInfo || {})
        ]);
        
        return result.lastID;
    }

    async getProducts(activeOnly = true) {
        let sql = 'SELECT * FROM products';
        if (activeOnly) {
            sql += ' WHERE is_active = 1';
        }
        sql += ' ORDER BY name';
        
        const products = await this.db.all(sql);
        
        return products.map(product => ({
            ...product,
            allergens: JSON.parse(product.allergens || '[]'),
            nutrition_info: JSON.parse(product.nutrition_info || '{}')
        }));
    }

    async updateProduct(id, updates) {
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(id);
        
        const sql = `UPDATE products SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        
        return await this.db.run(sql, values);
    }

    // Sales
    async createSale(sale) {
        const saleSQL = `
            INSERT INTO sales (sale_number, subtotal, tax_amount, total, employee_name, shift_id, device_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const saleResult = await this.db.run(saleSQL, [
            sale.saleNumber || this.generateSaleNumber(),
            sale.subtotal,
            sale.taxAmount,
            sale.total,
            sale.employeeName,
            sale.shiftId,
            sale.deviceId
        ]);
        
        const saleId = saleResult.lastID;
        
        // Insert sale items
        const itemSQL = `
            INSERT INTO sale_items (sale_id, product_id, product_name, unit_price, quantity, line_total, ai_confidence)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        for (const item of sale.items) {
            await this.db.run(itemSQL, [
                saleId,
                item.productId,
                item.name,
                item.price,
                item.quantity,
                item.price * item.quantity,
                item.confidence || null
            ]);
        }
        
        return saleId;
    }

    async getSales(dateFrom, dateTo, employeeName = null) {
        let sql = `
            SELECT s.*, si.product_name, si.unit_price, si.quantity, si.line_total
            FROM sales s
            LEFT JOIN sale_items si ON s.id = si.sale_id
            WHERE s.created_at BETWEEN ? AND ?
        `;
        
        const params = [dateFrom, dateTo];
        
        if (employeeName) {
            sql += ' AND s.employee_name = ?';
            params.push(employeeName);
        }
        
        sql += ' ORDER BY s.created_at DESC';
        
        const rows = await this.db.all(sql, params);
        
        // Group by sale
        const salesMap = new Map();
        
        rows.forEach(row => {
            if (!salesMap.has(row.id)) {
                salesMap.set(row.id, {
                    id: row.id,
                    saleNumber: row.sale_number,
                    subtotal: row.subtotal,
                    taxAmount: row.tax_amount,
                    total: row.total,
                    employeeName: row.employee_name,
                    createdAt: row.created_at,
                    items: []
                });
            }
            
            if (row.product_name) {
                salesMap.get(row.id).items.push({
                    name: row.product_name,
                    price: row.unit_price,
                    quantity: row.quantity,
                    total: row.line_total
                });
            }
        });
        
        return Array.from(salesMap.values());
    }

    generateSaleNumber() {
        const now = new Date();
        const date = now.toISOString().split('T')[0].replace(/-/g, '');
        const time = now.getTime().toString().slice(-6);
        return `SALE-${date}-${time}`;
    }

    // Analytics
    async getDailySalesAnalytics(date) {
        const sql = `
            SELECT 
                COUNT(*) as total_sales,
                SUM(total) as total_revenue,
                AVG(total) as average_sale,
                COUNT(DISTINCT employee_name) as employees_active
            FROM sales 
            WHERE DATE(created_at) = DATE(?)
        `;
        
        return await this.db.get(sql, [date]);
    }

    async getTopProducts(dateFrom, dateTo, limit = 10) {
        const sql = `
            SELECT 
                si.product_name,
                SUM(si.quantity) as total_quantity,
                SUM(si.line_total) as total_revenue,
                COUNT(*) as times_sold
            FROM sale_items si
            JOIN sales s ON si.sale_id = s.id
            WHERE s.created_at BETWEEN ? AND ?
            GROUP BY si.product_name
            ORDER BY total_revenue DESC
            LIMIT ?
        `;
        
        return await this.db.all(sql, [dateFrom, dateTo, limit]);
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DatabaseSchema,
        DatabaseMigrator,
        BakeryDAL
    };
}

if (typeof window !== 'undefined') {
    window.DatabaseSchema = DatabaseSchema;
    window.DatabaseMigrator = DatabaseMigrator;
    window.BakeryDAL = BakeryDAL;
}