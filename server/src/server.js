import dotenv from "dotenv";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";
import { configureSocket } from "./socket.js";
import seedInitialData from "./seeders/seedInitialData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always load the server env file regardless of the current working directory.
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const PORT = process.env.PORT || 5000;
const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173", "http://localhost:5174"].filter(Boolean);

const startServer = async () => {
  try {
    // Connect to MongoDB before starting the Express server.
    await connectDB();
    await seedInitialData();

    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        credentials: true
      }
    });

    configureSocket(io);
    app.set("io", io);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    // If database startup fails, log the reason and exit cleanly.
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
