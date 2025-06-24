
import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Database, Table, Server } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConnectDatabaseDialog } from './ConnectDatabaseDialog';

interface Table {
  id: string;
  name: string;
  rowCount: number;
}

interface DatabaseConnection {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'sqlite';
  status: 'connected' | 'disconnected';
  tables: Table[];
}

interface DatabaseSidebarProps {
  isCollapsed: boolean;
  onSelectTable: (dbId: string, table: Table, database: DatabaseConnection) => void;
  selectedTable: { dbId: string; tableId: string } | null;
}

const initialMockDatabases: DatabaseConnection[] = [
  {
    id: 'db1',
    name: 'Production DB',
    type: 'postgresql',
    status: 'connected',
    tables: [
      { id: 'users', name: 'users', rowCount: 1247 },
      { id: 'orders', name: 'orders', rowCount: 8932 },
      { id: 'products', name: 'products', rowCount: 456 },
      { id: 'reviews', name: 'reviews', rowCount: 3421 }
    ]
  },
  {
    id: 'db2',
    name: 'Analytics DB',
    type: 'mysql',
    status: 'connected',
    tables: [
      { id: 'events', name: 'events', rowCount: 45231 },
      { id: 'sessions', name: 'sessions', rowCount: 12890 },
      { id: 'metrics', name: 'metrics', rowCount: 67543 }
    ]
  },
  {
    id: 'db3',
    name: 'Test Environment',
    type: 'sqlite',
    status: 'disconnected',
    tables: [
      { id: 'test_users', name: 'test_users', rowCount: 25 },
      { id: 'test_data', name: 'test_data', rowCount: 100 }
    ]
  }
];

export const DatabaseSidebar: React.FC<DatabaseSidebarProps> = ({
  isCollapsed,
  onSelectTable,
  selectedTable
}) => {
  const [databases, setDatabases] = useState<DatabaseConnection[]>(initialMockDatabases);
  const [expandedDbs, setExpandedDbs] = useState<Set<string>>(new Set(['db1']));

  const handleNewConnection = (newConnection: DatabaseConnection) => {
    setDatabases(prev => [...prev, newConnection]);
  };

  const toggleDbExpansion = (dbId: string) => {
    const newExpanded = new Set(expandedDbs);
    if (newExpanded.has(dbId)) {
      newExpanded.delete(dbId);
    } else {
      newExpanded.add(dbId);
    }
    setExpandedDbs(newExpanded);
  };

  const getStatusColor = (status: string) => {
    return status === 'connected' ? 'text-green-500' : 'text-red-500';
  };

  const getDbIcon = (type: string) => {
    switch (type) {
      case 'postgresql':
        return '🐘';
      case 'mysql':
        return '🐬';
      case 'sqlite':
        return '📁';
      default:
        return '💾';
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4 space-y-4">
        {databases.map((db) => (
          <div
            key={db.id}
            className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center cursor-pointer hover:bg-accent transition-colors"
            title={db.name}
          >
            <span className="text-lg">{getDbIcon(db.type)}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-2 mb-4">
          <Server className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Database Connections</h2>
        </div>
        <ConnectDatabaseDialog onConnect={handleNewConnection} />
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {databases.map((db) => (
          <div key={db.id} className="mb-2">
            <div
              className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
              onClick={() => toggleDbExpansion(db.id)}
            >
              <div className="flex items-center space-x-3">
                <div className="text-lg">{getDbIcon(db.type)}</div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">{db.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{db.type}</div>
                </div>
                <div className={cn("w-2 h-2 rounded-full", getStatusColor(db.status))} />
              </div>
              <div className="transition-transform duration-200">
                {expandedDbs.has(db.id) ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
            
            {expandedDbs.has(db.id) && (
              <div className="ml-8 mt-1 space-y-1">
                {db.tables.map((table) => (
                  <div
                    key={table.id}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors",
                      selectedTable?.dbId === db.id && selectedTable?.tableId === table.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    )}
                    onClick={() => onSelectTable(db.id, table, db)}
                  >
                    <div className="flex items-center space-x-2">
                      <Table className="w-4 h-4" />
                      <span className="text-sm font-medium">{table.name}</span>
                    </div>
                    <span className="text-xs opacity-70">{table.rowCount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
