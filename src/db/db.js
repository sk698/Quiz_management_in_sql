import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Note: Your index.js already configures dotenv,
// so this file will have access to process.env
// (assuming index.js is your entry point)

/**
 * 1. CREATE THE POOL
 * This pool is created immediately when the module is loaded.
 * It will be shared across the entire application.
 */
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,  // Adjust as needed
    queueLimit: 0,
    connectTimeout: 10000 // 10 seconds to connect
});

/**
 * 2. CREATE THE CONNECTION TESTER
 * This is the named export `connectDB` that your index.js imports.
 * Its job is to verify that the pool can successfully connect
 * to the database before the web server starts.
 */
export const connectDB = async () => {
    try {
        // Try to get one connection from the pool
        const connection = await pool.getConnection();
        
        // Run a simple 'ping' query
        await connection.query('SELECT 1');
        
        // Release the connection back to the pool
        connection.release();
        
        console.log("MySQL Database connected successfully.");
        // This function resolving (completing without error)
        // is the signal to index.js's .then() block to proceed.

    } catch (error) {
        // If connection fails
        console.error("MySQL Database connection error:", error.message);
        
        // This throw will be caught by the .catch() block in your index.js,
        // and the application will exit, which is the correct behavior.
        throw new Error(`Database connection failed: ${error.message}`);
    }
};

/**
 * 3. CREATE THE QUERY HELPERS
 * This is the default export that your controllers will use.
 * It provides the query function and the pool for transactions.
 */
const db = {
    /**
     * A simple query function that uses the pool.
     * @param {string} sql The SQL query string.
     * @param {Array<any>} params The parameters to bind to the query.
     * @returns {Promise<Array<any>>} The query result rows.
     */
    query: async (sql, params) => {
        try {
            // The pool handles getting a connection, running the query,
            // and releasing the connection.
            const [rows, fields] = await pool.execute(sql, params);
            return rows;
        } catch (error) {
            // Log the error
            console.error("Database query error:", error.message);
            // Re-throw it so the asyncHandler can catch it
            throw error;
        }
    },
    
    /**
     * Export the pool itself for more complex operations
     * like transactions, where you need to hold a single
     * connection open.
     */
    pool: pool
};

// Export the 'db' object as the default
export default db;
