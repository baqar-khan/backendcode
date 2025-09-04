// server.js
import Fastify from "fastify";
import dotenv from "dotenv";
import { AppDataSource } from "./Infrastructure/postgres.js";
import userRoutes from "./src/routes/user.route.js";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyIO from "fastify-socket.io";
import fastifyJwt from "@fastify/jwt";

dotenv.config();

const fastify = Fastify({
  logger: true,
  ajv: {
    customOptions: {
      keywords: ["example"], // allow "example" in schemas
    },
  },
});

async function startServer() {
  try {
    // ------------------- Initialize Database -------------------
    await AppDataSource.initialize();
    console.log("✅ Data Source has been initialized!");

    // ------------------- JWT Plugin -------------------
    await fastify.register(fastifyJwt, {
      secret: process.env.JWT_SECRET || "my_secret_key",
    });

    // Middleware to protect routes
    fastify.decorate("authenticate", async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.code(401).send({ error: "Unauthorized" });
      }
    });

    // ------------------- Swagger Configuration -------------------
    await fastify.register(fastifySwagger, {
      openapi: {
        info: {
          title: "User API",
          description: "API documentation for user registration and listing",
          version: "1.0.0",
        },
        servers: [{ url: "http://127.0.0.1:3000" }],
        tags: [{ name: "Users", description: "User related endpoints" }],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    });

    await fastify.register(fastifySwaggerUi, {
      routePrefix: "/docs",
      uiConfig: {
        docExpansion: "full",
        deepLinking: true,
      },
      staticCSP: true,
    });

    // ------------------- Socket.IO -------------------
    await fastify.register(fastifyIO, {
      cors: { origin: "*" },
      pingTimeout: 30000,
      pingInterval: 25000
    });

    // Socket.IO event handlers with Room system
    fastify.ready().then(() => {
      fastify.io.on("connection", (socket) => {
        console.log("🔌 User connected:", socket.id);

        // Join room event
        socket.on("joinRoom", ({ userName, roomId }) => {
          socket.join(roomId);
          socket.data.userName = userName;
          socket.data.roomId = roomId;

          console.log(`✅ ${userName} joined room: ${roomId}`);

          fastify.io.to(roomId).emit("receiveMessage", {
            sender: "System",
            message: `${userName} joined the room.`,
            time: new Date().toLocaleTimeString(),
          });
        });

        // Send message to room
        socket.on("sendMessage", (message) => {
          const { roomId, userName } = socket.data;
          if (roomId && userName) {
            fastify.io.to(roomId).emit("receiveMessage", {
              sender: userName,
              message,
              time: new Date().toLocaleTimeString(),
            });
          }
        });

        // User disconnect
        socket.on("disconnect", () => {
          const { roomId, userName } = socket.data;
          if (roomId && userName) {
            fastify.io.to(roomId).emit("receiveMessage", {
              sender: "System",
              message: `${userName} left the room.`,
              time: new Date().toLocaleTimeString(),
            });
            console.log(`❌ ${userName} disconnected from room: ${roomId}`);
          } else {
            console.log(`❌ A user disconnected before joining any room.`);
          }
        });
      });
    });

    // ------------------- Register Routes -------------------
    fastify.register(userRoutes, { prefix: "/users" });

    // ------------------- Start Server -------------------
    const PORT = process.env.SERVER_PORT || 3000;
    await fastify.listen({ port: PORT, host: "0.0.0.0" });

    console.log(`🚀 Server running at http://127.0.0.1:${PORT}`);
    console.log(`📄 Swagger docs available at http://127.0.0.1:${PORT}/docs`);
  } catch (err) {
    console.error("❌ Error during server startup:", err);
    process.exit(1);
  }
}

startServer();

export default fastify;
