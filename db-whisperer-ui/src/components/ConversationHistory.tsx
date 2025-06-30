import React from "react";
import { User, Bot, Copy, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Message } from "./DatabaseApp";

interface ConversationHistoryProps {
  messages: Message[];
  className?: string;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  messages,
  className,
}) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "SQL query has been copied to your clipboard.",
    });
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <Card className="flex-1 h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            Conversation History
            {messages.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {messages.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1">
          <ScrollArea className="h-full px-4 pb-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No conversation history yet.</p>
                <p className="text-sm mt-1">
                  Start by asking a question about your database.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((entry, id) => (
                  <div
                    key={`mess_${id}`}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {entry.user == "user" ? (
                          <User className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Bot className="w-4 h-4 text-green-600" />
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {entry.user == "user" ? "User" : "System"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        {entry.user == "user"
                          ? entry.message
                          : entry.response.human_readable_response}
                      </p>
                    </div>

                    {entry.response && (
                      <div className="bg-muted/50 rounded-md p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            Generated SQL
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              copyToClipboard(entry.response.query)
                            }
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <pre className="text-xs font-mono text-foreground overflow-x-auto">
                          {entry.response.query}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
