import React, { useState } from 'react';
import { Send, Play, AlertCircle, CheckCircle, Loader2, Copy, Download, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

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

interface QueryResult {
  columns: string[];
  rows: any[][];
  affectedRows?: number;
  executionTime: number;
}

interface GeneratedQuery {
  sql: string;
  explanation: string;
  confidence: number;
}

interface QueryInterfaceProps {
  selectedDatabase?: DatabaseConnection | null;
  selectedTable?: { dbId: string; tableId: string } | null;
}

export const QueryInterface: React.FC<QueryInterfaceProps> = ({
  selectedDatabase,
  selectedTable
}) => {
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [generatedQuery, setGeneratedQuery] = useState<GeneratedQuery | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [showApproval, setShowApproval] = useState(false);
  const { toast } = useToast();

  const mockQueryGeneration = async (input: string): Promise<GeneratedQuery> => {
    // Simulate API call to generate SQL from natural language
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const queries = [
      {
        sql: `SELECT * FROM ${selectedTable || 'users'} WHERE created_at > '2024-01-01' LIMIT 10;`,
        explanation: "This query retrieves the first 10 records from the users table created after January 1st, 2024.",
        confidence: 95
      },
      {
        sql: `SELECT COUNT(*) as total_users FROM ${selectedTable || 'users'};`,
        explanation: "This query counts the total number of users in the database.",
        confidence: 98
      }
    ];
    
    return queries[Math.floor(Math.random() * queries.length)];
  };

  const mockQueryExecution = async (sql: string): Promise<QueryResult> => {
    // Simulate query execution
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      columns: ['id', 'name', 'email', 'created_at'],
      rows: [
        [1, 'John Doe', 'john@example.com', '2024-01-15'],
        [2, 'Jane Smith', 'jane@example.com', '2024-01-16'],
        [3, 'Bob Johnson', 'bob@example.com', '2024-01-17'],
        [4, 'Alice Brown', 'alice@example.com', '2024-01-18'],
        [5, 'Charlie Wilson', 'charlie@example.com', '2024-01-19']
      ],
      executionTime: 145
    };
  };

  const handleGenerateQuery = async () => {
    if (!naturalLanguageInput.trim()) return;
    
    setIsGenerating(true);
    try {
      const query = await mockQueryGeneration(naturalLanguageInput);
      setGeneratedQuery(query);
      setShowApproval(true);
      setQueryResult(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate query. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExecuteQuery = async () => {
    if (!generatedQuery) return;
    
    setIsExecuting(true);
    try {
      const result = await mockQueryExecution(generatedQuery.sql);
      setQueryResult(result);
      setShowApproval(false);
      toast({
        title: "Query executed successfully",
        description: `Returned ${result.rows.length} rows in ${result.executionTime}ms`,
      });
    } catch (error) {
      toast({
        title: "Execution Error",
        description: "Failed to execute query. Please check the SQL syntax.",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "SQL query has been copied to your clipboard.",
    });
  };

  const getCurrentTable = () => {
    if (!selectedDatabase || !selectedTable) return null;
    return selectedDatabase.tables.find(table => table.id === selectedTable.tableId);
  };

  const currentTable = getCurrentTable();

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header with Database Context */}
      <div className="p-6 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Database Query Interface</h1>
            {selectedDatabase ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-primary" />
                  <Badge variant="outline" className="font-medium">{selectedDatabase.name}</Badge>
                  <Badge variant="secondary" className="text-xs">{selectedDatabase.type}</Badge>
                </div>
                {currentTable && (
                  <>
                    <span className="text-muted-foreground">→</span>
                    <Badge variant="secondary" className="font-medium">{currentTable.name}</Badge>
                  </>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Select a database from the sidebar to begin</p>
            )}
          </div>
          {selectedDatabase && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Connected to</p>
              <p className="font-semibold text-foreground">{selectedDatabase.name}</p>
              <div className="flex items-center justify-end space-x-2 mt-1">
                <div className={cn("w-2 h-2 rounded-full", 
                  selectedDatabase.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                )} />
                <span className="text-xs text-muted-foreground capitalize">{selectedDatabase.status}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Query Input Section */}
        <div className="p-6 border-b border-border">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="w-5 h-5" />
                <span>Natural Language Query</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={selectedDatabase 
                  ? `Ask anything about the ${selectedDatabase.name} database... e.g., 'Show me all users' or 'Count total orders'`
                  : "Select a database first, then ask anything about your data..."
                }
                value={naturalLanguageInput}
                onChange={(e) => setNaturalLanguageInput(e.target.value)}
                className="min-h-[100px] resize-none"
                disabled={!selectedDatabase}
              />
              <Button 
                onClick={handleGenerateQuery}
                disabled={!naturalLanguageInput.trim() || isGenerating || !selectedDatabase}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Query...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Generate SQL Query
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Section - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Generated Query Approval */}
          {showApproval && generatedQuery && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <span>Generated Query - Approval Required</span>
                  </div>
                  <Badge variant={generatedQuery.confidence > 90 ? "default" : "secondary"}>
                    {generatedQuery.confidence}% confidence
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{generatedQuery.explanation}</p>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto">
                      {generatedQuery.sql}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(generatedQuery.sql)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={handleExecuteQuery}
                    disabled={isExecuting}
                    className="flex-1"
                  >
                    {isExecuting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Execute Query
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowApproval(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Query Results */}
          {queryResult && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Query Results</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {queryResult.rows.length} rows • {queryResult.executionTime}ms
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {queryResult.columns.map((column, index) => (
                          <TableHead key={index} className="font-semibold">
                            {column}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queryResult.rows.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <TableCell key={cellIndex}>
                              {cell}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!selectedDatabase && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Database className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Database Selected</h3>
                <p className="text-muted-foreground">
                  Select a database from the sidebar to start querying your data
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
