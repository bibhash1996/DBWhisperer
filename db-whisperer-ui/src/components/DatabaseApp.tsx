import React, { useState } from "react";
import { DatabaseSidebar } from "./DatabaseSidebar";
import { QueryInterface } from "./QueryInterface";
import { PWAInstallPrompt } from "./PWAInstallPrompt";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

interface Table {
  id: string;
  name: string;
  rowCount: number;
}

interface DatabaseConnection {
  id: string;
  name: string;
  type: "postgresql" | "mysql" | "sqlite";
  status: "connected" | "disconnected";
  tables: Table[];
}

export const DatabaseApp: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTable, setSelectedTable] = useState<{
    dbId: string;
    tableId: string;
  } | null>(null);
  const [selectedDatabase, setSelectedDatabase] =
    useState<DatabaseConnection | null>(null);

  const handleSelectTable = (dbId: string, table: string, database: any) => {
    setSelectedTable({ dbId, tableId: table });
    setSelectedDatabase(database);
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
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
              ? `Connected to ${selectedDatabase.name}`
              : "Select a database to begin"}
          </div>
        </div>

        <QueryInterface
          selectedDatabase={selectedDatabase}
          selectedTable={selectedTable}
        />
      </div>

      <PWAInstallPrompt />
    </div>
  );
};
