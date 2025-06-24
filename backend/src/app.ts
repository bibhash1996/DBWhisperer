import express from "express";
import dotenv from "dotenv";
import dbRoutes from "./routes/db.routes";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to DB Whisperer API" });
});

app.use("/db", dbRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
