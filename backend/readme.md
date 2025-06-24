# DB Whisperer Backend

This is the backend server for the DB Whisperer application, built with Express.js, TypeScript, LangChain, and LangGraph.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
```

3. Start the development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev`: Start the development server with hot reload
- `npm run build`: Build the TypeScript project
- `npm start`: Start the production server
- `npm run lint`: Run ESLint
- `npm run test`: Run tests

## Project Structure

```
backend/
├── src/
│   ├── controllers/    # Route controllers
│   ├── routes/        # Express routes
│   ├── services/      # Business logic
│   ├── models/        # Data models
│   ├── config/        # Configuration files
│   └── app.ts         # Express app setup
├── tests/             # Test files
├── package.json
└── tsconfig.json
```

## API Documentation

API documentation will be added as endpoints are implemented.

## Technologies Used

- Express.js
- TypeScript
- LangChain
- LangGraph
- ESLint
- Jest (for testing)
