import supertest from "supertest";
import mongoose from "mongoose";
import app from "../index";
import dotenv from "dotenv";
import { base64 } from "../lib/helper";

dotenv.config();
const request = supertest(app);

let accessToken = "";
let refreshToken = "";

describe("test environment", () => {
  beforeAll((done) => {
    if (process.env.MDB_TEST_URL !== undefined) {
      mongoose.connect(process.env.MDB_TEST_URL).then(() => {
        console.log("Connected to Atlas");
        done();
      });
    }
  });

  it("2 should test that I cannot get anything without accesstoken", async () => {
    const response = await request
      .get("/api/v1/user/me")
      .set("Origin", "http://localhost:3000");

    expect(response.status).toBe(401);
  });

  it("3) User can register", async () => {
    const response = await request
      .post("/api/v1/auth/register")
      .set("Origin", "http://localhost:3000")
      .set(
        "Authorization",
        `Basic ${base64(["test@example.com", "1234"].join(":"))}`
      );

    expect(response.status).toBe(201);
  });

  it("4) User can login", async () => {
    const response = await request
      .post("/api/v1/auth/login")
      .set("Origin", "http://localhost:3000")
      .set(
        "Authorization",
        `Basic ${base64(["test@example.com", "1234"].join(":"))}`
      )
      .send();

    expect(response.status).toBe(200);
    expect(response.body.access_token).not.toBeUndefined;
    accessToken = response.body.access_token;

    expect(response.body.refresh_token).not.toBeUndefined;
    refreshToken = response.body.refresh_token;
  });

  it("5) should test that it works with an access_token", async () => {
    const response = await request
      .get("/api/v1/user/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Origin", "http://localhost:3000");

    expect(response.status).toBe(200);
  });

  it("6 It should test that I need to provide a refreshToken to get new accessToken", async () => {
    const response = await request
      .post("/api/v1/auth/refreshToken")
      .set("Authorization", `Bearer test`)
      .set("Origin", "http://localhost:3000");

    expect(response.status).toBe(401);
  });

  it("7) It should test that I need to provide a refreshToken to get new accessToken", async () => {
    const response = await request
      .post("/api/v1/auth/refreshToken")
      .set("Authorization", `Bearer ${refreshToken}`)
      .set("Origin", "http://localhost:3000")
      .send();

    expect(response.status).toBe(401);
    expect(response.body.access_token).not.toBeUndefined;
    accessToken = response.body.access_token;
    expect(response.body.refresh_token).not.toBeUndefined;
    refreshToken = response.body.refresh_token;
  });

  it("8) It should test that the old refreshToken does not work anymore", async () => {
    const response = await request
      .post("/api/v1/auth/refreshToken")
      .set("Authorization", `Bearer ${refreshToken}`)
      .set("Origin", "http://localhost:3000")
      .send();

    expect(response.status).toBe(401);
  });

  it("9) User need to login again", async () => {
    const response = await request
      .post("/api/v1/auth/login")
      .set("Origin", "http://localhost:3000")
      .set(
        "Authorization",
        `Basic ${base64(["test@example.com", "1234"].join(":"))}`
      )
      .send();

    expect(response.status).toBe(200);
    expect(response.body.access_token).not.toBeUndefined;
    accessToken = response.body.access_token;

    expect(response.body.refresh_token).not.toBeUndefined;
    refreshToken = response.body.refresh_token;
  });

  it("10) should test that it works again with an access_token", async () => {
    const response = await request
      .get("/api/v1/user/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Origin", "http://localhost:3000");

    expect(response.status).toBe(200);
  });

  afterAll((done) => {
    mongoose.connection.dropDatabase().then(() => {
      mongoose.connection.close().then(done);
      console.log("Disconnected");
    });
  });
});
