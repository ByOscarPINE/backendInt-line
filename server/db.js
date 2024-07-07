import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Prueba de conexión
pool.getConnection()
    .then(connection => {
        console.log('Conexión a la base de datos exitosa');
        connection.release();
    })
    .catch(err => {
        console.error('Error de conexión a la base de datos:', err);
    });