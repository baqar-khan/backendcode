import UserController from "../controllers/user.controller.js";
import UserService from "../services/user.service.js";
import UserRepository from "../repository/user.repository.js";
import dataSource from "../../Infrastructure/postgres.js";
import jwt from "jsonwebtoken";

export default async function userRoutes(fastify) {
  const userRepository = new UserRepository(dataSource);
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  // 📄 Swagger schema for POST /register
  const registerUserSchema = {
    summary: "Register a new user",
    description: "Creates a new user in the system and returns a JWT token.",
    tags: ["Users"],
    body: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string", example: "John Doe" },
      },
    },
    response: {
      201: {
        description: "✅ User successfully created",
        type: "object",
        properties: {
          id: { type: "number", example: 1 },
          name: { type: "string", example: "John Doe" },
          token: { type: "string", example: "eyJhbGciOi..." },
        },
      },
      400: {
        description: "❌ Validation error",
        type: "object",
        properties: {
          message: { type: "string", example: "Name is required" },
        },
      },
    },
  };
  // 📄 Swagger schema for GET /get
const getAllUsersSchema = {
  summary: "Get all users",
  description: "Fetches all registered users. You can also filter by name. (Requires JWT token)",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  querystring: {  
    type: "object",
    properties: {
      search: { type: "string", example: "John Doe" },
    },
  },
  response: {
    200: {
      description: "✅ List of users",
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "number", example: 1 },
          name: { type: "string", example: "John Doe" },
        },
      },
    },
  },
};
  // ✅ Register route
  fastify.post("/register", { schema: registerUserSchema }, async (req, reply) => {
    const user = await userController.registerUser(req, reply);

    if (!user?.id) {
      return reply.code(400).send({ message: "User registration failed" });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name },
      process.env.JWT_SECRET,
    );

    return reply.code(201).send({ ...user, token });
  });
  
// ✅ Get all users route
  fastify.get("/alluser", { schema: getAllUsersSchema },  async (req, reply) => {
    const { search } = req.query;
    return userController.getAllUsers(req, reply, search);
  });

  // ✅ JWT Auth Hook (only for protected routes)
  fastify.addHook("preHandler", async (req, reply) => {
    if (req.routerPath?.startsWith("/users") && req.method === "GET") {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          return reply.code(401).send({ message: "No token provided" });
        }
        const token = authHeader.split(" ")[1];
        req.user = jwt.verify(token, process.env.JWT_SECRET);
      } catch {
        return reply.code(401).send({ message: "Invalid or expired token" });
      }
    }
  });

  
}


