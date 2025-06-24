import { Pool as PgPool } from "pg";
import mysql from "mysql2/promise";

export type DatabaseConnection = {
  connectionName: string;
  databaseType: string;
  host: string;
  port: number;
  databaseName: string;
  username: string;
  password: string;
  id?: string;
};

// In-memory storage for connections
export const connections: DatabaseConnection[] = [];

export class Database {
  private config: DatabaseConnection;
  private pgPool?: PgPool;
  private mysqlPool?: mysql.Pool;

  constructor(config: DatabaseConnection) {
    this.config = config;
    if (config.databaseType === "PostgreSQL") {
      this.pgPool = new PgPool({
        host: config.host,
        port: config.port,
        database: config.databaseName,
        user: config.username,
        password: config.password,
        ssl: {
          rejectUnauthorized: false,
        },
      });
    } else if (config.databaseType === "MySQL") {
      this.mysqlPool = mysql.createPool({
        host: config.host,
        port: config.port,
        database: config.databaseName,
        user: config.username,
        password: config.password,
      });
    } else {
      throw new Error("Unsupported database type");
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      if (this.pgPool) {
        await this.pgPool.query("SELECT 1");
        return true;
      } else if (this.mysqlPool) {
        const [rows] = await this.mysqlPool.query("SELECT 1");
        return true;
      }
      throw new Error("Unsupported database type");
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async executeQuery(query: string): Promise<any> {
    if (this.pgPool) {
      const result = await this.pgPool.query(query);
      return result.rows;
    } else if (this.mysqlPool) {
      const [rows] = await this.mysqlPool.query(query);
      return rows;
    }
    throw new Error("Unsupported database type");
  }
}
