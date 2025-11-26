import "dotenv/config";
import startServer from "./server.js";
import connectDatabase from "./db/connectDatabase.js";

const bootstrap = async () => {
  await connectDatabase();
  startServer();
};
bootstrap();
