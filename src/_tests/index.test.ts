import supertest from "supertest";
import mongoose from "mongoose";
import app from "../index";
import dotenv from "dotenv";

dotenv.config();
const request = supertest(app);

describe("test environment", () => {
  beforeAll((done) => {
    if (process.env.MDB_TEST_URL !== undefined) {
      mongoose.connect(process.env.MDB_TEST_URL).then(() => {
        console.log("Connected to Atlas");
        done();
      });
    }
  });

  it("1) should be that true is true", () => {
    expect(true).toBe(true);
  });

  it("2) User can register", async () => {
    const response = await request
      .post("/user/register")
      .send({ email: "test@example.com" });
    expect(response.status).toBe(201);
  });

  afterAll((done) => {
    mongoose.connection.dropDatabase().then(() => {
      mongoose.connection.close().then(done);
      console.log("Disconnected");
    });
  });
});
