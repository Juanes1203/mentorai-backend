import mysql from 'mysql2/promise';
declare const pool: mysql.Pool;
export declare const testConnection: () => Promise<boolean>;
export declare const query: (sql: string, params?: any[]) => Promise<mysql.QueryResult>;
export default pool;
//# sourceMappingURL=database.d.ts.map