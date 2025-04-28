import { Client, Pool } from 'pg';
import { config } from './config.js';

let client;

export const connectDb = async () => {
  try {
    if (config.usePooling) {
      client = new Pool({
        connectionString: config.database.url,
        max: config.database.maxPoolSize,
        idleTimeoutMillis: config.database.idleTimeoutMillis,
        connectionTimeoutMillis: config.database.connectionTimeoutMillis,
      });
    } else {
      client = new Client({
        connectionString: config.database.url,
        connectionTimeoutMillis: config.database.connectionTimeoutMillis,
      });
      await client.connect();
    }
    console.log(`Connected to the database successfully with ${config.usePooling ? 'pooling' : 'single connection'}`);
  } catch (error) {
    console.error('Error connecting to the database:', error);
    system.exit(1);
  }
};

export const query = async (text, params, { onlyFirstRow = false } = {}) => {
  const res = await client.query(text, params);
  return onlyFirstRow ? res.rows[0] : res.rows;
};

export const closeDb = async () => {
  try {
    await client.end();
    console.log('Database connection closed successfully');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
};
