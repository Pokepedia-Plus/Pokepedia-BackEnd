require("dotenv").config();
const { Pool } = require("pg");

const connectionDevelopment = {
  user: `${process.env.USER}`,
  database: `${process.env.DATABASE}`,
  password: `${process.env.PG_SECRET}`,
  host: `${process.env.HOST}`,
  port: 5432,
};

const connectionProduction = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
};

const pool = new Pool(
  process.env.NODE_ENV === "production"
    ? connectionProduction
    : connectionDevelopment
);
module.exports = pool;