import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { loanRoutes } from "./routes/loan.routes";
import { checkLLMAvailability } from "./utils/llm.util";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", loanRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "AI Server is running" });
});

// Start server
const server = app.listen(PORT, async () => {
  console.log(`AI Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API Endpoint: http://localhost:${PORT}/api/enhance-loan`);

  // Check if LLM is available
  const isLLMAvailable = await checkLLMAvailability();
  if (isLLMAvailable) {
    console.log(`✅ LLM Model '${OLLAMA_MODEL}' is available and ready to use`);
  } else {
    console.warn(`⚠️ WARNING: LLM Model '${OLLAMA_MODEL}' is not available.`);
    console.warn(`Make sure Ollama is running and the model is installed.`);
    console.warn(`You can install the model with: ollama pull ${OLLAMA_MODEL}`);
  }
});

// Handle shutdown gracefully
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

export default app;
