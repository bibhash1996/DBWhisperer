import React, { useState } from "react";
import { DatabaseSidebar } from "./DatabaseSidebar";
import { QueryInterface } from "./QueryInterface";
import { PWAInstallPrompt } from "./PWAInstallPrompt";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NaturalExecutionResponse } from "@/api/db";
import { ConversationHistory } from "./ConversationHistory";

interface Table {
  id: string;
  name: string;
  rowCount: number;
}

export interface Message {
  user: "system" | "user";
  message?: string;
  response?: NaturalExecutionResponse;
}

interface DatabaseConnection {
  id: string;
  connectionName: string;
  databaseType: "PostgreSQL" | "MySQL";
  status: "connected" | "disconnected";
  tables: string[];
}

export const DatabaseApp: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTable, setSelectedTable] = useState<{
    dbId: string;
    tableId: string;
  } | null>(null);
  const [selectedDatabase, setSelectedDatabase] =
    useState<DatabaseConnection | null>(null);
  const [historyCollapsed, setHistoryCollapsed] = useState(false);

  const handleSelectTable = (dbId: string, table: string, database: any) => {
    setSelectedTable({ dbId, tableId: table });
    setSelectedDatabase(database);
  };

  return (
    <div className="max-h-screen bg-background flex w-full">
      <DatabaseSidebar
        isCollapsed={sidebarCollapsed}
        onSelectTable={handleSelectTable}
        selectedTable={selectedTable}
      />

      <div className="flex-1 flex flex-col">
        <div className="border-b border-border p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-8 w-8 p-0"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>

          <div className="text-sm text-muted-foreground">
            {selectedDatabase
              ? `Connected to ${selectedDatabase.connectionName}`
              : "Select a database to begin"}
          </div>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <QueryInterface
            selectedDatabase={selectedDatabase}
            selectedTable={selectedTable}
            addMessages={(message) => {
              setMessages((msgs) => [...msgs, message]);
            }}
          />
          <ConversationHistory messages={messages} />
        </div>
      </div>

      <PWAInstallPrompt />
    </div>
  );
};
