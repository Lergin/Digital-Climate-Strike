// @tsed/cli do not edit
import {MysqlConnectionOptions} from "typeorm/driver/mysql/MysqlConnectionOptions";

const DB_USERNAME = process.env.DB_USERNAME || "participation";
const DB_HOST = process.env.DB_HOST || "mysql";
const DB_DATABASE = process.env.DB_DATABASE || "participation";
const DB_PORT = process.env.DB_PORT || 3306;
const DB_PASSWORD = process.env.DB_PASSWORD || "participation";

const defaultOptions: MysqlConnectionOptions = {

  name: "default",
  type: "mysql",
  host: DB_HOST,
  port: DB_PORT as number,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  synchronize: true,
  logging: false,
  entities: [
    "${rootDir}/entity/**/*.{js,ts}"
  ],
  migrations: [
    "${rootDir}/migration/**/*.{js,ts}"
  ],
  subscribers: [
    "${rootDir}/subscriber/**/*.{js,ts}"
  ],
  cli: {
    entitiesDir: "${rootDir}/entity",
    migrationsDir: "${rootDir}/migration",
    subscribersDir: "${rootDir}/subscriber"
  }
}
export default [
  defaultOptions
];
