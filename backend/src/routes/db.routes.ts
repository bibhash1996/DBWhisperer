import express, { Request, Response } from "express";
import {
  Database,
  DatabaseConnection,
  connections,
} from "../models/connection";
import { v4 as uuidv4 } from "uuid";
import { graph } from "../controllers/graph";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  return res.status(200).json({
    data: connections,
  });
});

router.post("/connection", async (req: Request, res: Response) => {
  const {
    connectionName,
    databaseType,
    host,
    port,
    databaseName,
    username,
    password,
  } = req.body;

  if (
    !connectionName ||
    !databaseType ||
    !host ||
    !port ||
    !databaseName ||
    !username ||
    !password
  ) {
    res.status(400).json({ error: "All fields are required." });
    return;
  }

  const newConnection: DatabaseConnection = {
    connectionName,
    databaseType,
    host,
    port: Number(port),
    databaseName,
    username,
    password,
    id: uuidv4(),
    tables: [],
  };

  /**
   * 1. Test connection
   * 2. If connection is successful, save connection to database
   * 3. If connection is not successful, return error
   */

  const db = new Database(newConnection);
  const result = await db.testConnection();

  if (!result) {
    res.status(500).json({ error: "Connection test failed." });
    return;
  }

  const tables = await db.executeQuery(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE';
  `);

  newConnection.tables = (tables || []).map((t: any) => t.table_name);
  connections.push(newConnection);

  res.status(201).json({
    message: "Connection saved successfully.",
    connection: newConnection,
  });
});

router.post("/connection/test", async (req: Request, res: Response) => {
  const { id } = req.body;
  const connection = connections.find((connection) => connection.id === id);
  if (!connection) {
    res.status(404).json({ error: "Connection not found." });
    return;
  }

  const db = new Database(connection);

  const result = await db.testConnection();

  if (result)
    res
      .status(200)
      .json({ message: "Connection tested successfully.", result });
  else res.status(500).json({ error: "Connection test failed." });
});

router.post("/execute/:id", async (req: Request, res: Response) => {
  let threadId = uuidv4();
  const response = await graph.invoke(
    {
      question: req.body.question,
      connection_id: req.params.id,
    },
    {
      configurable: {
        thread_id: threadId,
      },
    }
  );

  delete response.db;
  delete response.schema;
  response.threadId = threadId;
  console.log(response);
  res.status(200).json({
    data: response,
  });
});

router.post("/approve/:id", async (req: Request, res: Response) => {
  let threadId = req.body.threadId;
  const response = await graph.invoke(null, {
    configurable: {
      thread_id: threadId,
    },
  });

  delete response.db;
  delete response.schema;
  console.log(response);
  res.status(200).json({
    data: response,
  });
});

router.get("/sample/:id", async (req: Request, res: Response) => {
  const connection = connections.find(
    (connection) => connection.id === req.params.id
  );
  if (!connection) {
    res.status(404).json({ error: "Connection not found." });
    return;
  }
  const db = new Database(connection);

  let tableName = req.query.table as string;
  console.log(tableName);

  const response = await db.executeQuery(
    `SELECT * FROM "${tableName}" LIMIT 3`
  );

  res.status(200).json({
    data: response,
  });
});

export default router;
