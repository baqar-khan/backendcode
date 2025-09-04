import User from "../entities/User.js";

export default class UserRepository {
  constructor(dataSource) {
    this.repo = dataSource.getRepository(User);
  }

  async createUser(userData) {
    const user = this.repo.create(userData);
    return await this.repo.save(user);
  }

  async findAll() {
    return await this.repo.find();
  }

  async findByName(name) {
    return await this.repo.find({
      where: { name }
    });
  }
}
