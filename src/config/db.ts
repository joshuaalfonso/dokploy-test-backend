import "dotenv/config";


import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  port: Number(process.env.DB_PORT || 3306)
});

export const testConnection = async () => {
    try {
        const conn = await pool.getConnection();
        console.log("Database is alive!");
        conn.release();
    }
    catch (err) {
        console.error("Database connection failed:", err);
        process.exit(1);
    }
};