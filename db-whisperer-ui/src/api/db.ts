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
