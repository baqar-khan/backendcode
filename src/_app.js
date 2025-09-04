import path from "path";
import { fileURLToPath } from "url";

import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import fastifyCookie from "@fastify/cookie";
import socketIO from "socket.io";
import formbody from "@fastify/formbody";
import fastifyJwt from "@fastify/jwt";

// Custom configs
import swaggerUiObject from "../Infrastructure/swaggerUiObject.js";
import swaggerObject from "../Infrastructure/swaggerObject.js";
import { logger } from "../Infrastructure/logger.js";

// Routes
import userRoutes from "./routes/user.route.js";

// __dirname ka ESM version
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverInitializer = (fastify) => {
  try {
    // ✅ Register Fastify plugins
    fastify.register(formbody); // Parse form-data
    fastify.register(fastifyMultipart); // File uploads
    fastify.register(fastifyCookie); // Cookie parser
    fastify.register(fastifyJwt, {
      secret: process.env.JWT_SECRET || "your_jwt_secret_key_here",
    }); // JWT Auth
    fastify.register(fastifySwagger, swaggerObject.options); // Swagger JSON
    fastify.register(fastifySwaggerUi, swaggerUiObject); // Swagger UI
    fastify.register(fastifyStatic, {
      root: path.join(__dirname, "../public"), // Serve static files
    });

    // ✅ Health check route
    fastify.get("/", async () => ({
      code: 200,
      status: "OK",
      message: "Fastify server is running",
    }));

    // ✅ Register all application routes
    fastify.register(userRoutes, { prefix: "/users" });

    // ✅ Socket.IO setup on ready
    fastify.ready((err) => {
      if (err) throw err;

      const io = socketIO(fastify.server, {
        cors: { origin: "*" },
      });

      io.on("connection", (socket) => {
        logger.info("✅ User connected");

        // Example chat event
        socket.on("chat message", (msg) => {
          io.emit("chat message", msg);
        });

        socket.on("disconnect", () => {
          logger.info("❌ User disconnected");
        });
      });
    });
  } catch (error) {
    logger.error("❌ App initialization failed:", error);
    process.exit(1);
  }
};

export default serverInitializer;
