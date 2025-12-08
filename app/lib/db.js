import mysql from "mysql2/promise";

export async function getDbConnection() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "car_booking_db" // change if your DB name is different
  });

  return connection;
}

