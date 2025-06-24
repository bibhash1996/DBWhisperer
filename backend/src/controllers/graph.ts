import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import readline from "readline";
import { connections, Database } from "../models/connection";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

interface State {
  question: string | null;
  schema: string | null;
  query: string | null;
  relevant: string | null;
  result: string | null;
  logs: string[];
  query_result: any[] | null;
  connection_id: string | null;
  human_readable_response: string | null;
  db: Database | null;
}

const GraphState = {
  question: null,
  schema: null,
  query: null,
  relevant: null,
  result: null,
  query_result: null,
  connection_id: null,
  human_readable_response: null,
  db: null,
  logs: {
    value: (x: string[], y: string[]) => y,
    default: () => [],
  },
};

function humanReadableArray(arr: any, options: any = {}) {
  const {
    separator = ", ",
    lastSeparator = " and ",
    keyFormatter = (key: any) => key.replace(/_/g, " ").toUpperCase(),
    valueFormatter = (value: any) => value,
  } = options;

  return arr
    .map((obj: any) => {
      return Object.entries(obj)
        .map(([key, value]) => `${keyFormatter(key)}: ${valueFormatter(value)}`)
        .join("; ");
    })
    .join(separator)
    .replace(/,([^,]*)$/, lastSeparator + "$1");
}

const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-3.5-turbo",
  temperature: 0,
});

const getConnection = (connection_id: string) => {
  const connection = connections.find(
    (connection) => connection.id === connection_id
  );
  return connection;
};

const connect = async (state: State) => {
  if (!state.connection_id) {
    throw new Error("Invalid connection id");
  }
  const connection = getConnection(state.connection_id);
  if (!connection) {
    throw new Error("Invalid connection");
  }
  const db = new Database(connection);

  if (!db) throw new Error("Error connecting to database");

  return {
    ...state,
    db,
  };
};

// Function to Get Database Schema
const getDatabaseSchema = async (db: Database) => {
  try {
    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    const tablesResult = await db.executeQuery(tablesQuery);
    // console.log(tablesResult);
    const tables = tablesResult.map((row: any) => row.table_name);
    let schema = "";
    for (const table of tables) {
      schema += `Table : ${table} \n`;
      const columnsQuery = `
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = '${table}';
      `;
      const columnsResult = await db.executeQuery(columnsQuery);
      let rows = "";
      for (let row of columnsResult) {
        rows += `${row.column_name} : ${row.data_type} ,`;
      }
      schema += `Columns ${rows}`;
      schema += "\n";
    }
    // client.release();
    return schema;
  } catch (err) {
    console.error("Error fetching schema:", err);
    throw err;
  }
};

async function isQuestionRelevant(state: State) {
  console.log("=========================================");
  console.log("          CHECK RELEVANCE                ");
  console.log("=========================================");
  let logs = state.logs;

  logs.push("CHECK RELEVANCE");

  let schema = state.schema;
  let question = state.question;
  //   console.log(state);
  if (!state.question) {
    console.error("❌ Error: Question is missing from state!");
    return { ...state, relevant: "not_relevant" };
  }
  console.log(`Checking relevance of the question: ${question}`);
  let SYSTEM = `You are an assistant that determines whether a given question is related to the following database schema.
                Schema: ${schema}
                Question: ${question}
                Respond with only single word as  "relevant" or "not_relevant
                Response:
                `;
  const prompt = PromptTemplate.fromTemplate(SYSTEM);
  const chain = RunnableSequence.from([
    prompt,
    llm,
    new StringOutputParser(),
    {
      relevance: (prev) => prev,
    },
  ]);
  const response = await chain.invoke({});
  console.log(
    "Relevance : ",
    response?.relevance.toLowerCase() || "not_relevant"
  );
  logs.push(
    `Relevance : ${response?.relevance.toLowerCase() || "not_relevant"}`
  );
  return {
    ...state,
    relevant: response?.relevance.toLowerCase() || "not_relevant",
    logs,
  };
}

function shouldContinue(state: State) {
  const relevant = state.relevant;
  if (relevant == "relevant") {
    return "yes";
  }
  return "no";
}

async function getSchema(state: State): Promise<State> {
  console.log("=========================================");
  console.log("          GETTING SCHEMA                ");
  console.log("=========================================");
  if (!state.question) {
    console.error("❌ Error: Question is missing from state!");
    return { ...state, relevant: "not_relevant", schema: "Schema not found" };
  }
  const schema = await getDatabaseSchema(state.db as Database);
  return {
    ...state,
    schema: schema || "Schema not found",
  };
}

async function generateFunnyResponse(state: State) {
  console.log("=========================================");
  console.log("       GENERATING FUNNY RESPONSE         ");
  console.log("=========================================");
  let logs = state.logs;

  logs.push("GENERATING FUNNY RESPONSE");
  let system = `You are a charming and funny assistant who responds in a playful manner.`;
  let human_message =
    "I can not help with that, but doesn't asking questions make you hungry? You can always order something delicious.";

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", system],
    ["human", human_message],
  ]);

  const chain = prompt.pipe(llm).pipe(new StringOutputParser());
  const response = await chain.invoke({});
  console.log("Response : ", response);
  return {
    ...state,
    result: response,
    logs,
  };
}

async function convertToSQL(state: State) {
  console.log("=========================================");
  console.log("          CONVERTING TO SQL                ");
  console.log("=========================================");
  let logs = state.logs;
  logs.push("CONVERTING TO SQL ");
  const schema = state.schema;
  const question = state.question;
  const sytemMesssage = `
    You are an assistant that converts natural language questions into SQL queries based on the following schema:
    ${schema}
    Provide only the SQL query without any explanations. Alias columns appropriately to match the expected keys in the result.
    For example, alias 'Campus.name' as 'campus_name' and 'Campus.type' as 'campus_type'.

    Also to note : 
    1. Never generate queries that update the table. Restrict the queries to only Database reads.
    2. Always use double quotes for table names and column names.
    3. Also limit the result rows to maximum 100 rows
    
    Question: ${question}
    `;

  const prompt = PromptTemplate.fromTemplate(sytemMesssage);
  const chain = RunnableSequence.from([
    prompt,
    llm,
    new StringOutputParser(),
    { query: (prev) => prev },
  ]);
  const response = await chain.invoke({});
  console.log("QUERY : ", response.query);
  return {
    ...state,
    query: response.query,
    logs,
  };
}

async function executeSql(state: State) {
  console.log("=========================================");
  console.log("          EXECUTING SQL QUERY             ");
  console.log("=========================================");
  let logs = state.logs;
  logs.push("EXECUTING SQL QUERY");
  const query = state.query as string;
  try {
    const response = await (state.db as Database).executeQuery(query);
    console.log(response);
    let result = humanReadableArray(response);
    console.log("Query Result");
    console.log(result);
    return {
      query_result: result,
    };
  } catch (error) {
    return {
      ...state,
      query_result: `Error executing query : ${(error as Error).message}`,
      logs,
    };
  }
}

async function generateHumarReadableResponse(state: State) {
  console.log("=========================================");
  console.log("    GENERATE HUMAN READABLE RESPONSE     ");
  console.log("=========================================");
  let logs = state.logs;
  logs.push("GENERATE HUMAN READABLE RESPONSE");
  const question = state.question;
  const query = state.query;
  const result = state.query_result;
  console.log("Generating a human-readable answer.");
  const message = `You are an assistant that converts SQL query results into clear, natural language responses without including any identifiers like order IDs. Start the response with a friendly greeting.
  Human Question asked : ${question} \n
  Query Results : ${result} \n

  Try to understand the query results and generate the response accordingly

  Response : 
  `;
  const prompt = PromptTemplate.fromTemplate(message);

  const chain = RunnableSequence.from([
    prompt,
    llm,
    new StringOutputParser(),
    { message: (prev) => prev },
  ]);

  const response = await chain.invoke({});
  console.log("AI Response : ", response.message);
  return {
    ...state,
    human_readable_response: response.message,
    logs,
  };
}

const workflow = new StateGraph<State>({ channels: GraphState })
  .addNode("connect", connect)
  .addNode("getSchema", getSchema)
  .addNode("isRelevant", isQuestionRelevant)
  .addNode("convertToSQL", convertToSQL)
  .addNode("generateFunnyResponse", generateFunnyResponse)
  .addNode("executeSql", executeSql)
  .addNode("generateHumarReadableResponse", generateHumarReadableResponse)
  .addEdge(START, "connect")
  .addEdge("connect", "getSchema")
  .addEdge("getSchema", "isRelevant")
  .addConditionalEdges("isRelevant", shouldContinue, {
    yes: "convertToSQL",
    no: "generateFunnyResponse",
  })
  .addEdge("convertToSQL", "executeSql")
  .addEdge("executeSql", "generateHumarReadableResponse")
  .addEdge("generateFunnyResponse", END)
  .addEdge("generateHumarReadableResponse", END);

const graph = workflow.compile();

/**
 * pass in connection id and question to get the results
 */

export { graph };

/**
 * main function
 */
// async function main() {
//   while (true) {
//     const input = await new Promise((resolve) => {
//       rl.question("⏳ Ask Something : ", resolve);
//     });
//     if (input == "exit") {
//       console.log("Good Bye ");
//       process.exit(0);
//     }

//     const response = await graph.invoke({
//       question: input,
//       connection_id: "",
//       //   question: "How are you?",
//     });
//     console.log("\n\n");
//   }
// }

// main();

/**
 * ToDO:
 *  1. Human in the Loop Flow
 *  2.
 */
