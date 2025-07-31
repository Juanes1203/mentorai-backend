"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.testConnection = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mentorai_db',
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};
// Crear pool de conexiones
const pool = promise_1.default.createPool(dbConfig);
// Función para probar la conexión
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión a la base de datos establecida correctamente');
        connection.release();
        return true;
    }
    catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
        return false;
    }
};
exports.testConnection = testConnection;
// Función para ejecutar consultas
const query = async (sql, params) => {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    }
    catch (error) {
        console.error('Error ejecutando consulta:', error);
        throw error;
    }
};
exports.query = query;
exports.default = pool;
//# sourceMappingURL=database.js.map