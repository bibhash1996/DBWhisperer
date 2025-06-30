import React, { useEffect, useState } from "react";
import {
  Send,
  Play,
  AlertCircle,
  CheckCircle,
  Loader2,
  Copy,
  MessageSquare,
  Database,
  User,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { executeNaturalLanguageQuery, getSampleData } from "@/api/db";
import { TabularData } from "./TabularData";
import { Message } from "./DatabaseApp";

interface GeneratedQuery {
  sql: string;
}

interface QueryInterfaceProps {
  selectedDatabase?: any | null;
  selectedTable?: { dbId: string; tableId: string } | null;
  addMessages: (message: Message) => void;
}

export const QueryInterface: React.FC<QueryInterfaceProps> = ({
  selectedDatabase,
  selectedTable,
  addMessages,
}) => {
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [sampleData, setSampleData] = useState<any[]>([]);
  const [showApproval, setShowApproval] = useState(false);
  const [queryResult, setQueryResult] = useState<{ [key: string]: any }>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedTable)
      getSampleData(selectedTable.dbId, selectedTable.tableId).then((data) => {
        setSampleData(data);
      });
  }, [selectedTable]);

  //   input: string
  // ): Promise<GeneratedQuery> => {
  //   // Simulate API call to generate SQL from natural language
  //   await new Promise((resolve) => setTimeout(resolve, 2000));

  //   const queries = [
  //     {
  //       sql: `SELECT * FROM ${
  //         selectedTable || "users"
  //       } WHERE created_at > '2024-01-01' LIMIT 10;`,
  //       explanation:
  //         "This query retrieves the first 10 records from the users table created after January 1st, 2024.",
  //       confidence: 95,
  //     },
  //     {
  //       sql: `SELECT COUNT(*) as total_users FROM ${selectedTable || "users"};`,
  //       explanation:
  //         "This query counts the total number of users in the database.",
  //       confidence: 98,
  //     },
  //   ];

  //   return queries[Math.floor(Math.random() * queries.length)];
  // };

  // const mockQueryExecution = async (sql: string): Promise<QueryResult> => {
  //   // Simulate query execution
  //   await new Promise((resolve) => setTimeout(resolve, 1500));

  //   return {
  //     columns: ["id", "name", "email", "created_at"],
  //     rows: [
  //       [1, "John Doe", "john@example.com", "2024-01-15"],
  //       [2, "Jane Smith", "jane@example.com", "2024-01-16"],
  //       [3, "Bob Johnson", "bob@example.com", "2024-01-17"],
  //       [4, "Alice Brown", "alice@example.com", "2024-01-18"],
  //       [5, "Charlie Wilson", "charlie@example.com", "2024-01-19"],
  //     ],
  //     executionTime: 145,
  //   };
  // };

  const handleGenerateQuery = async () => {
    if (!naturalLanguageInput.trim()) return;
    // setMessages((messages) => [
    //   ...messages,
    //   { user: "user", message: naturalLanguageInput.trim() },
    // ]);
    addMessages({ user: "user", message: naturalLanguageInput.trim() });
    setIsGenerating(true);
    setNaturalLanguageInput("");
    try {
      const response = await executeNaturalLanguageQuery(
        selectedTable.dbId,
        naturalLanguageInput.trim()
      );
      // setMessages((messages) => [...messages, { user: "system", response }]);
      setQueryResult(response.query_result);
      addMessages({ user: "system", response });
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "SQL query has been copied to your clipboard.",
    });
  };

  const getCurrentTable = () => {
    if (!selectedDatabase || !selectedTable) return null;
    return selectedDatabase.tables.find(
      (table) => table === selectedTable.tableId
    );
  };

  const currentTable = getCurrentTable();

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header with Database Context */}
      <div className="p-6 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Database Query Interface
            </h1>
            {selectedDatabase ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-primary" />
                  <Badge variant="outline" className="font-medium">
                    {selectedDatabase.connectionName}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {selectedDatabase.databaseType}
                  </Badge>
                </div>
                {currentTable && (
                  <>
                    <span className="text-muted-foreground">→</span>
                    <Badge variant="secondary" className="font-medium">
                      {currentTable}
                    </Badge>
                  </>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Select a database from the sidebar to begin
              </p>
            )}
          </div>
          {selectedDatabase && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Connected to</p>
              <p className="font-semibold text-foreground">
                {selectedDatabase.connectionName}
              </p>
              <div className="flex items-center justify-end space-x-2 mt-1">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    selectedDatabase.status === "connected"
                      ? "bg-green-500"
                      : "bg-red-500"
                  )}
                />
                <span className="text-xs text-muted-foreground capitalize">
                  {selectedDatabase.status}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {sampleData && sampleData.length ? (
        <div className="flex max-w-[50vw]">
          <TabularData
            heading="Sample Dataset"
            columns={Object.keys(sampleData[0])}
            data={sampleData}
            hide={true}
          />
        </div>
      ) : undefined}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Query Input Section */}
        <div className="p-6 border-b border-border">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="w-5 h-5" />
                <span>
                  Natural Language Query
                  <span className="text-sm"> (Database context)</span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={
                  selectedDatabase
                    ? `Ask anything about the ${selectedDatabase.connectionName} database... e.g., 'Show me all users' or 'Count total orders'`
                    : "Select a database first, then ask anything about your data..."
                }
                value={naturalLanguageInput}
                onChange={(e) => setNaturalLanguageInput(e.target.value)}
                className="min-h-[100px] resize-none"
                disabled={!selectedDatabase}
              />
              <Button
                onClick={handleGenerateQuery}
                disabled={
                  !naturalLanguageInput.trim() ||
                  isGenerating ||
                  !selectedDatabase
                }
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

        {/* Query result */}
        <div className="flex-1  space-y-6">
          {/* Empty State */}
          {queryResult && Array.isArray(queryResult) && queryResult.length ? (
            <TabularData
              heading="Query Result"
              columns={Object.keys(queryResult[0])}
              data={queryResult}
              hide={false}
            />
          ) : null}
        </div>

        {/* Results Section - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Empty State */}
          {!selectedDatabase && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Database className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Database Selected
                </h3>
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
