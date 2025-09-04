import UserService from "../services/user.service.js";

export default class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  async registerUser(req, reply) {
    try {
      const { name } = req.body;

      // 1️⃣ User create karo
      const user = await this.userService.registerUser(name);

      // 2️⃣ JWT token generate karo (fastify-jwt ka use)
      const token = req.server.jwt.sign(
        { id: user.id, name: user.name }, // payload
        { expiresIn: "1h" } // token expiry
      );

      // 3️⃣ Response send karo
      return reply.code(201).send({
        message: "User registered successfully",
        user,
        token
      });

    } catch (err) {
      req.log.error(err);
      return reply.code(400).send({ message: err.message });
    }
  }

  async getAllUsers(req, reply, name) {
    try {
      const users = await this.userService.getAllUsers(name);
      return reply.send(users);
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  }
}
