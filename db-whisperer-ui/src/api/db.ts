import { API_BASE_URL } from "./const";

interface CreateConnection {
  connectionName: string;
  databaseType: string;
  host: string;
  port: string;
  databaseName: string;
  username: string;
  password: string;
}

export interface NaturalExecutionResponse {
  threadId: string;
  question: string;
  query: string;
  relevant: string;
  query_result: any[];
  connection_id: string;
  human_readable_response: string;
  logs: string[];
}

export async function getAllConnections() {
  const response = await fetch(`${API_BASE_URL}/db`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (response.status >= 200 && response.status <= 299) {
    const data = await response.json();
    return data.data;
  }
  console.log(`Error : `, response);
}

export async function createConnection(connection: CreateConnection) {
  const response = await fetch(`${API_BASE_URL}/db/connection`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(connection),
  });
  if (response.status >= 200 && response.status <= 299) {
    const data = await response.json();
    return data.connection;
  }
}

export async function getSampleData(connectionId: string, table: string) {
  const response = await fetch(
    `${API_BASE_URL}/db/sample/${connectionId}?table=${table}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (response.status >= 200 && response.status <= 299) {
    const data = await response.json();
    return data.data;
  }
}

export async function executeNaturalLanguageQuery(
  connectionId: string,
  question: string
): Promise<NaturalExecutionResponse> {
  const response = await fetch(`${API_BASE_URL}/db/execute/${connectionId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });
  if (response.status >= 200 && response.status <= 299) {
    const data = await response.json();
    return data.data;
  }
}

export async function approveQuery(
  connectionId: string,
  threadId: string
): Promise<NaturalExecutionResponse> {
  const response = await fetch(`${API_BASE_URL}/db/approve/${connectionId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ threadId }),
  });
  if (response.status >= 200 && response.status <= 299) {
    const data = await response.json();
    return data.data;
  }
}
