
import UserRepository from "../repository/user.repository.js";

export default class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async registerUser(name) {
    if (!name) {
      throw new Error("Name is required");
    }
    return await this.userRepository.createUser({ name });
  }

  async getAllUsers(name) {
    if (name) {
      return await this.userRepository.findByName(name);
    }
    return await this.userRepository.findAll();
  }
}
