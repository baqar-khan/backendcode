import { EntitySchema } from "typeorm";

const UserEntity = new EntitySchema({
  name: "User",
  tableName: "fastify_users",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    name: {
      type: "varchar",
      nullable: false,
      unique: true
    },
    createdAt: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP"
    }
  }
});

export default UserEntity;
