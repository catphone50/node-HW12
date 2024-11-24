import "dotenv/config";
import { MongoClient } from "mongodb";

const mongoURI = process.env.MONGODB_URI;
const client = new MongoClient(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let dbConnection = null;

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");
    dbConnection = client.db();
  } catch (err) {
    console.log("Failed to connect to MongoDB", err);
    throw err;
  }
}

function getDB() {
  if (!dbConnection) {
    throw new Error("Database not connected!");
  }
  return dbConnection;
}

export { connectToDatabase, getDB };
