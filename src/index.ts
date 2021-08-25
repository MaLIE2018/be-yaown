import express from "express";
import cors from "cors";
import route from "./services";
import createHttpError from "http-errors";
import errorHandlers from "./lib/errorHandler";
import mongoose from "mongoose";

const app = express();

const origins = [process.env.FE_URL];

export const PORT = process.env.PORT || 3001;

const corsOptions = {
  origin: function (origin: any, next: any) {
    if (origins.includes(origin)) {
      next(null, true);
    } else {
      console.log("origin403:", origin);
      next(createHttpError(403, { m: "Check your cors settings!" }));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/v1", route);
app.use(errorHandlers);

if (!process.env.MDB_URL) throw new Error("MDB_URL not	set!");

mongoose.connect(process.env.MDB_URL, {}).then(() => {
  console.log("mongoose connected");
  app.listen(PORT, () => {
    console.table({ "Server running on port ": PORT });
  });
});

export default app;
