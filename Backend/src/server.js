import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 5003;

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
