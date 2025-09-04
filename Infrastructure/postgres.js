import { DataSource } from "typeorm";
import UserEntity from "../src/entities/User.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5435,
  username: "docker",
  password: "docker",
  database: "postgres",
  synchronize: true, // dev ke liye
  logging: true,
  entities: [UserEntity], // Yaha register kiya
});
export default AppDataSource;