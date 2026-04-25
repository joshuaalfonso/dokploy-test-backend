import "dotenv/config";


import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST  || 'localhost',
  user: process.env.DB_USER  || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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