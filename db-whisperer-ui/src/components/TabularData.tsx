import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function TabularData(props: {
  heading: string;
  data: any[];
  columns: string[];
}) {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    setHide(true);
  }, [props.columns]);

  return (
    <div className="p-6 border-b border-border overflow-x-auto max-w-[80vw]">
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>{props.heading || "Data"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{props.data.length} rows</Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setHide((hi) => !hi)}
              >
                {/* <Download className="w-4 h-4 mr-1" /> */}
                {hide ? "Show" : "Hide"}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hide ? (
            <p> Sample dataset is hidden</p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    {props.columns.map((column, index) => (
                      <TableHead key={index} className="font-semibold">
                        {column}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {props.data.map((row, rowIndex) => (
                    <TableRow key={`${row["id"]}`}>
                      {props.columns.map((col, cellIndex) => (
                        <TableCell key={`${row["id"]}_${cellIndex}`}>
                          {JSON.stringify(row[col])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
